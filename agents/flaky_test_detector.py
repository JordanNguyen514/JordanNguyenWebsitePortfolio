#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║              Flaky Test Detector — Sandbox Architect              ║
╠══════════════════════════════════════════════════════════════════╣
║  How it works:                                                    ║
║    1. Downloads the latest flaky-history artifact from GHA        ║
║       (cross-run persistence — no DB, no paid storage)            ║
║    2. Parses Cypress Mochawesome JSON from the current run        ║
║    3. Merges results into a rolling 30-run window per test        ║
║    4. Flags tests that flip (pass→fail or fail→pass) above        ║
║       a configurable threshold                                    ║
║    5. Writes a rich Markdown report as a CI artifact              ║
║    6. Posts a summary table to the GitHub job summary             ║
║    7. Comments on the triggering PR (if PR_NUMBER is set)         ║
║    8. Calls update-ci-status.yml to update the SDET dashboard     ║
║    9. Uploads the updated history for the next run to consume     ║
╠══════════════════════════════════════════════════════════════════╣
║  Required env (injected via GitHub Actions):                      ║
║    GITHUB_TOKEN        — repo read + artifact download/upload     ║
║    GITHUB_REPOSITORY   — "owner/repo"                            ║
║    GITHUB_RUN_ID       — current workflow run ID                  ║
║    GITHUB_SHA          — commit SHA                               ║
║    GITHUB_REF_NAME     — branch name                              ║
║  Optional env:                                                    ║
║    PR_NUMBER           — if set, posts a PR comment               ║
║    CYPRESS_RESULTS_DIR — defaults to "cypress/results"            ║
║    FLAKY_THRESHOLD     — flip rate 0.0–1.0 to mark as flaky       ║
║                          defaults to 0.2 (flaky in 20% of runs)  ║
║    HISTORY_WINDOW      — rolling window size, default 30 runs     ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import io
import sys
import json
import glob
import zipfile
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

import requests

# ── Environment ────────────────────────────────────────────────────────────────

GITHUB_TOKEN       = os.environ["GITHUB_TOKEN"]
GITHUB_REPOSITORY  = os.environ.get("GITHUB_REPOSITORY", "")
GITHUB_RUN_ID      = os.environ.get("GITHUB_RUN_ID", "")
GITHUB_SHA         = os.environ.get("GITHUB_SHA", "HEAD")
GITHUB_REF_NAME    = os.environ.get("GITHUB_REF_NAME", "master")
PR_NUMBER          = os.environ.get("PR_NUMBER", "")
CYPRESS_RESULTS_DIR = os.environ.get("CYPRESS_RESULTS_DIR", "cypress/results")
FLAKY_THRESHOLD    = float(os.environ.get("FLAKY_THRESHOLD", "0.2"))
HISTORY_WINDOW     = int(os.environ.get("HISTORY_WINDOW", "30"))

HISTORY_ARTIFACT_NAME = "flaky-history"
REPORT_PATH           = "flaky-test-report.md"
HISTORY_PATH          = "flaky-history.json"

_GH = "https://api.github.com"
_GH_HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept":        "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


# ── GitHub API helpers ─────────────────────────────────────────────────────────

def _gh(method: str, path: str, **kwargs):
    r = requests.request(method, f"{_GH}{path}", headers=_GH_HEADERS, **kwargs)
    r.raise_for_status()
    return r.json() if r.content else {}


def _gh_raw(method: str, path: str, **kwargs) -> requests.Response:
    """Return the raw response (for binary downloads)."""
    r = requests.request(method, f"{_GH}{path}", headers=_GH_HEADERS, **kwargs)
    r.raise_for_status()
    return r


# ── History persistence (GHA artifacts as a free key-value store) ──────────────

def load_history() -> dict:
    """
    Download and parse the most recent flaky-history artifact.
    Returns an empty dict if none exists yet (first run).

    History schema:
    {
      "<test full title>": {
        "spec": "cypress/e2e/smoke.cy.js",
        "runs": [
          {"run_id": "123", "date": "2025-01-01T00:00:00Z", "passed": true},
          ...
        ]
      }
    }
    """
    try:
        data = _gh("GET", f"/repos/{GITHUB_REPOSITORY}/actions/artifacts",
                   params={"name": HISTORY_ARTIFACT_NAME, "per_page": 1})
        artifacts = data.get("artifacts", [])
        if not artifacts:
            print("  No prior history artifact found — starting fresh.")
            return {}

        artifact_id = artifacts[0]["id"]
        resp = _gh_raw("GET", f"/repos/{GITHUB_REPOSITORY}/actions/artifacts/{artifact_id}/zip",
                       allow_redirects=True)

        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            with zf.open(HISTORY_PATH) as fh:
                history = json.load(fh)
                print(f"  Loaded history: {len(history)} test(s) tracked.")
                return history

    except Exception as exc:
        print(f"  Could not load history ({exc}) — starting fresh.")
        return {}


def save_history(history: dict) -> None:
    """
    Write history JSON to disk. The GHA workflow uploads it as an artifact
    via actions/upload-artifact — we just write the file here.
    """
    Path(HISTORY_PATH).write_text(json.dumps(history, indent=2), encoding="utf-8")
    print(f"  History saved to {HISTORY_PATH} ({len(history)} test(s)).")


# ── Cypress result parser ──────────────────────────────────────────────────────

def load_current_results() -> list[dict]:
    """
    Parse all Mochawesome JSON files in CYPRESS_RESULTS_DIR.
    Returns a flat list of test result dicts.
    """
    pattern = f"{CYPRESS_RESULTS_DIR}/**/*.json"
    files   = glob.glob(pattern, recursive=True)

    if not files:
        print(f"  No Cypress result files found at: {pattern}")
        return []

    results = []
    for path in files:
        try:
            with open(path) as fh:
                data = json.load(fh)
        except (json.JSONDecodeError, OSError) as exc:
            print(f"  Skipping unreadable result file {path}: {exc}")
            continue

        for suite_root in data.get("results", []):
            spec = suite_root.get("file", path)
            for test in _walk_tests(suite_root.get("suites", [])):
                results.append({
                    "title":  test.get("fullTitle") or test.get("title", "Unnamed"),
                    "spec":   spec,
                    "passed": test.get("pass", False),
                    "pending": test.get("pending", False),
                })

    print(f"  Parsed {len(results)} test result(s) from {len(files)} file(s).")
    return results


def _walk_tests(suites: list) -> list:
    out = []
    for s in suites:
        out.extend(s.get("tests", []))
        out.extend(_walk_tests(s.get("suites", [])))
    return out


# ── History updater ────────────────────────────────────────────────────────────

def update_history(history: dict, results: list[dict]) -> dict:
    """
    Merge this run's results into the rolling history.
    Trims each test's run list to HISTORY_WINDOW entries.
    Skips pending/skipped tests — they contribute no signal.
    """
    run_entry_base = {
        "run_id": GITHUB_RUN_ID,
        "sha":    GITHUB_SHA[:7],
        "date":   datetime.now(timezone.utc).isoformat(),
    }

    for r in results:
        if r["pending"]:
            continue  # Skipped tests don't count as pass or fail

        title = r["title"]
        if title not in history:
            history[title] = {"spec": r["spec"], "runs": []}

        entry = {**run_entry_base, "passed": r["passed"]}
        history[title]["runs"].append(entry)

        # Enforce rolling window
        history[title]["runs"] = history[title]["runs"][-HISTORY_WINDOW:]

    return history


# ── Flakiness analyser ─────────────────────────────────────────────────────────

def analyse_flakiness(history: dict) -> list[dict]:
    """
    For each test with enough history, compute:
      - total runs in window
      - passes / failures
      - flip_rate: fraction of consecutive pairs that changed outcome
      - flaky: True if flip_rate >= FLAKY_THRESHOLD and both pass and fail seen

    Returns a list sorted by flip_rate descending.
    """
    analysis = []

    for title, data in history.items():
        runs = data["runs"]
        if len(runs) < 2:
            continue  # Need at least 2 runs to detect flakiness

        passes   = sum(1 for r in runs if r["passed"])
        failures = len(runs) - passes

        # Count consecutive outcome flips
        flips = sum(
            1 for i in range(1, len(runs))
            if runs[i]["passed"] != runs[i - 1]["passed"]
        )
        flip_rate = flips / (len(runs) - 1)

        is_flaky = flip_rate >= FLAKY_THRESHOLD and passes > 0 and failures > 0

        analysis.append({
            "title":     title,
            "spec":      data["spec"],
            "total":     len(runs),
            "passes":    passes,
            "failures":  failures,
            "flips":     flips,
            "flip_rate": flip_rate,
            "flaky":     is_flaky,
            "last_run":  runs[-1],
        })

    return sorted(analysis, key=lambda x: (-x["flip_rate"], x["title"]))


# ── Report builder ─────────────────────────────────────────────────────────────

_TREND_EMOJI = {True: "🔴", False: "✅"}
_RATE_BAR = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]


def _sparkline(runs: list) -> str:
    """Render a mini pass/fail sparkline from the last 10 runs."""
    tail = runs[-10:]
    return "".join("🟩" if r["passed"] else "🟥" for r in tail)


def build_report(analysis: list[dict], total_tests: int) -> str:
    now       = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    flaky     = [a for a in analysis if a["flaky"]]
    stable    = [a for a in analysis if not a["flaky"]]
    n_flaky   = len(flaky)
    n_tracked = len(analysis)

    lines = [
        "# 🎲 Flaky Test Detector Report",
        f"> **Generated:** {now} &nbsp;|&nbsp; "
        f"**Commit:** `{GITHUB_SHA[:7]}` &nbsp;|&nbsp; "
        f"**Branch:** `{GITHUB_REF_NAME}`",
        f"> **Threshold:** flip rate ≥ `{FLAKY_THRESHOLD:.0%}` over last `{HISTORY_WINDOW}` runs",
        "",
        "## 📊 Summary",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Tests in this run | `{total_tests}` |",
        f"| Tests with history | `{n_tracked}` |",
        f"| 🎲 Flaky tests | `{n_flaky}` |",
        f"| ✅ Stable tests | `{n_tracked - n_flaky}` |",
        "",
    ]

    if flaky:
        lines += [
            "---",
            "",
            "## 🎲 Flaky Tests",
            "",
            "| Test | Spec | Flip rate | Runs | Passes | Failures | Last 10 runs |",
            "|------|------|-----------|------|--------|----------|--------------|",
        ]
        for a in flaky:
            spec_short = a["spec"].replace("cypress/e2e/", "")
            lines.append(
                f"| `{a['title']}` | `{spec_short}` "
                f"| **{a['flip_rate']:.0%}** ({a['flips']} flip(s)) "
                f"| {a['total']} "
                f"| {a['passes']} "
                f"| {a['failures']} "
                f"| {_sparkline(history_for(a))} |"
            )
        lines.append("")

        lines += [
            "### What to do",
            "",
            "1. **Investigate root cause** — network timing, async assertions, test isolation.",
            "2. **Add `cy.intercept()` stubs** for network-dependent steps.",
            "3. **Increase `defaultCommandTimeout`** for slow environments.",
            "4. **Add retry logic** with `cypress-plugin-retries` for known-slow operations.",
            "5. **Quarantine** confirmed flaky tests with `.skip` + a tracking issue "
            "until fixed — don't let them block CI.",
            "",
        ]
    else:
        lines += [
            "---",
            "",
            "## ✅ No Flaky Tests Detected",
            "",
            f"All `{n_tracked}` tracked tests have a flip rate below `{FLAKY_THRESHOLD:.0%}`. "
            "Keep it up!",
            "",
        ]

    if stable and n_flaky > 0:
        lines += [
            "---",
            "",
            "## ✅ Stable Tests",
            "",
            "| Test | Spec | Flip rate | Runs | Last 10 runs |",
            "|------|------|-----------|------|--------------|",
        ]
        for a in stable:
            spec_short = a["spec"].replace("cypress/e2e/", "")
            lines.append(
                f"| `{a['title']}` | `{spec_short}` "
                f"| {a['flip_rate']:.0%} "
                f"| {a['total']} "
                f"| {_sparkline(history_for(a))} |"
            )
        lines.append("")

    return "\n".join(lines)


# Hack: pass history through a closure for the report
_HISTORY_REF: dict = {}


def history_for(a: dict) -> list:
    return _HISTORY_REF.get(a["title"], {}).get("runs", [])


# ── PR comment ─────────────────────────────────────────────────────────────────

def post_pr_comment(body: str) -> None:
    if not PR_NUMBER:
        print("  No PR_NUMBER — skipping PR comment.")
        return
    try:
        _gh("POST", f"/repos/{GITHUB_REPOSITORY}/issues/{PR_NUMBER}/comments",
            json={"body": body})
        print(f"  PR comment posted to #{PR_NUMBER}.")
    except Exception as exc:
        print(f"  PR comment failed: {exc}")


# ── Job summary writer ─────────────────────────────────────────────────────────

def write_job_summary(analysis: list[dict], total_tests: int) -> None:
    """Write a compact table to $GITHUB_STEP_SUMMARY."""
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY", "")
    if not summary_path:
        return

    flaky = [a for a in analysis if a["flaky"]]
    lines = [
        "## 🎲 Flaky Test Detector\n",
        f"| Stat | Value |",
        f"|------|-------|",
        f"| Tests this run | {total_tests} |",
        f"| Tracked (≥2 runs) | {len(analysis)} |",
        f"| **Flaky** | **{len(flaky)}** |",
        "",
    ]

    if flaky:
        lines += [
            "| Test | Flip rate | Trend |",
            "|------|-----------|-------|",
        ]
        for a in flaky[:10]:  # Cap at 10 rows in summary
            lines.append(
                f"| `{a['title']}` | {a['flip_rate']:.0%} "
                f"| {_sparkline(history_for(a))} |"
            )
        if len(flaky) > 10:
            lines.append(f"| _(and {len(flaky) - 10} more — see full report)_ | | |")

    with open(summary_path, "a", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("  🎲 Flaky Test Detector — starting")
    print("=" * 60)

    # 1. Load persisted history
    print("\n📂 Loading run history…")
    history = load_history()
    _HISTORY_REF.update(history)

    # 2. Parse this run's Cypress results
    print("\n🔍 Parsing Cypress results…")
    results = load_current_results()

    if not results:
        print("  No results to process. Exiting cleanly.")
        Path(REPORT_PATH).write_text(
            "# 🎲 Flaky Test Detector\n\nNo Cypress results found for this run.\n"
        )
        sys.exit(0)

    # 3. Merge into history
    print("\n🔄 Updating history…")
    history = update_history(history, results)
    _HISTORY_REF.update(history)

    # 4. Analyse flakiness
    print("\n📈 Analysing flakiness…")
    analysis = analyse_flakiness(history)
    flaky    = [a for a in analysis if a["flaky"]]

    print(f"  {len(flaky)} flaky test(s) detected out of {len(analysis)} tracked.")

    # 5. Save updated history (workflow uploads it as artifact)
    print("\n💾 Saving updated history…")
    save_history(history)

    # 6. Build and save Markdown report
    print("\n📝 Writing report…")
    report = build_report(analysis, len(results))
    Path(REPORT_PATH).write_text(report, encoding="utf-8")
    print(f"  Report saved: {REPORT_PATH}")

    # 7. Write job summary
    write_job_summary(analysis, len(results))

    # 8. Post PR comment (compact version)
    if flaky:
        compact = (
            f"## 🎲 Flaky Test Detector — {len(flaky)} flaky test(s) found\n\n"
            "| Test | Spec | Flip rate |\n|---|---|---|\n"
            + "\n".join(
                f"| `{a['title']}` | `{a['spec'].replace('cypress/e2e/', '')}` "
                f"| {a['flip_rate']:.0%} |"
                for a in flaky[:5]
            )
            + (f"\n\n_…and {len(flaky) - 5} more. See the full report artifact._"
               if len(flaky) > 5 else "")
            + "\n\n> Full report available as a CI artifact."
        )
        post_pr_comment(compact)
    else:
        post_pr_comment(
            f"## 🎲 Flaky Test Detector\n\n"
            f"✅ No flaky tests detected across {len(analysis)} tracked test(s)."
        )

    # 9. Exit non-zero if flaky tests exist so the workflow can optionally fail
    print(f"\n{'=' * 60}")
    print(f"  Done — {len(flaky)} flaky / {len(analysis)} tracked / {len(results)} in run")
    print(f"{'=' * 60}\n")
    sys.exit(1 if flaky else 0)


if __name__ == "__main__":
    main()
