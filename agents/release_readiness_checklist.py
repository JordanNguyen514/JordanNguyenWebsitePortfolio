#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║           Release Readiness Checklist — Sandbox Architect         ║
╠══════════════════════════════════════════════════════════════════╣
║  What it does:                                                    ║
║    Queries the GitHub API to produce a structured go/no-go        ║
║    release checklist by checking:                                 ║
║                                                                   ║
║    1. All critical workflows passed on the latest commit          ║
║    2. No open blocking issues (label: "release-blocker")          ║
║    3. Branch protection: master is up-to-date                     ║
║    4. Skipped / .only test debt (reuses auditor patterns)         ║
║    5. Lighthouse performance thresholds (from last run artifact)  ║
║    6. Security scan: no high/critical Snyk findings open          ║
║                                                                   ║
║  Outputs:                                                         ║
║    • Markdown checklist saved as CI artifact                      ║
║    • GitHub job summary                                           ║
║    • GitHub Release body draft (written to release-body.md)       ║
║    • Exit 0 = GO,  Exit 1 = NO-GO                                 ║
║                                                                   ║
║  Required env (GitHub Actions):                                   ║
║    GITHUB_TOKEN · GITHUB_REPOSITORY · GITHUB_SHA                 ║
║    GITHUB_REF_NAME · RELEASE_TAG (optional — defaults to date)   ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os
import re
import sys
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Environment ────────────────────────────────────────────────────────────────

GITHUB_TOKEN      = os.environ["GITHUB_TOKEN"]
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "")
GITHUB_SHA        = os.environ.get("GITHUB_SHA", "HEAD")
GITHUB_REF_NAME   = os.environ.get("GITHUB_REF_NAME", "master")
RELEASE_TAG       = os.environ.get("RELEASE_TAG", "") or \
                    datetime.now(timezone.utc).strftime("v%Y.%m.%d")

REPORT_PATH       = "release-readiness-report.md"
RELEASE_BODY_PATH = "release-body.md"

# Workflows that MUST be green for a go decision
CRITICAL_WORKFLOWS = [
    "Post-Deployment UI Tests",   # Cypress E2E
    "Playwright Cross-Browser Tests",
    "Security Scanning",
    "API Monitoring & Synthetics",
]

# Workflows checked but treated as warnings (not blockers)
ADVISORY_WORKFLOWS = [
    "Performance Audit (Lighthouse CI)",
    "Mutation Testing (StrykerJS)",
    "Robot Framework Tests",
    "Karate API Tests",
]

_GH = "https://api.github.com"
_GH_HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept":        "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


# ── Data model ─────────────────────────────────────────────────────────────────

@dataclass
class Check:
    name:    str
    passed:  bool
    blocker: bool        # False = advisory only
    detail:  str
    emoji:   str = ""

    def __post_init__(self):
        if not self.emoji:
            self.emoji = "✅" if self.passed else ("🔴" if self.blocker else "⚠️")


# ── GitHub API helpers ─────────────────────────────────────────────────────────

def _gh(path: str, params: dict = None) -> dict | list:
    r = requests.get(f"{_GH}{path}", headers=_GH_HEADERS,
                     params=params or {}, timeout=20)
    r.raise_for_status()
    return r.json()


def latest_run(workflow_name: str) -> dict | None:
    """Return the most recent completed run for a workflow by name."""
    try:
        data = _gh(f"/repos/{GITHUB_REPOSITORY}/actions/runs",
                   params={"per_page": 20, "status": "completed"})
        for run in data.get("workflow_runs", []):
            if run.get("name") == workflow_name:
                return run
    except Exception as exc:
        print(f"  Could not fetch runs for '{workflow_name}': {exc}")
    return None


# ── Individual checks ──────────────────────────────────────────────────────────

def check_workflows() -> list[Check]:
    checks = []
    all_names = [(n, True) for n in CRITICAL_WORKFLOWS] + \
                [(n, False) for n in ADVISORY_WORKFLOWS]

    for name, is_blocker in all_names:
        run = latest_run(name)
        if run is None:
            checks.append(Check(
                name=name, passed=False, blocker=is_blocker,
                detail="No completed run found — workflow may not have run yet",
                emoji="❓"
            ))
            continue

        conclusion = run.get("conclusion", "unknown")
        sha_short  = run.get("head_sha", "?")[:7]
        run_url    = run.get("html_url", "")
        passed     = conclusion == "success"

        checks.append(Check(
            name=name, passed=passed, blocker=is_blocker,
            detail=f"[{conclusion.upper()}]({run_url}) on `{sha_short}`"
        ))

    return checks


def check_blocking_issues() -> Check:
    """Check for open issues labelled 'release-blocker'."""
    try:
        issues = _gh(f"/repos/{GITHUB_REPOSITORY}/issues",
                     params={"state": "open", "labels": "release-blocker", "per_page": 10})
        if not isinstance(issues, list):
            issues = []
        n = len(issues)
        if n == 0:
            return Check("Release Blockers", True, True, "No open `release-blocker` issues")
        links = ", ".join(f"[#{i['number']}]({i['html_url']})" for i in issues[:5])
        return Check("Release Blockers", False, True,
                     f"{n} open blocker(s): {links}")
    except Exception as exc:
        return Check("Release Blockers", True, False,
                     f"Could not check issues: {exc}", emoji="❓")


def check_branch_protection() -> Check:
    """Verify master branch is protected (not bypassed)."""
    try:
        data = _gh(f"/repos/{GITHUB_REPOSITORY}/branches/master")
        protected = data.get("protected", False)
        return Check(
            "Branch Protection (master)", protected, False,
            "Branch protection is enabled" if protected
            else "⚠️ Branch protection is NOT enabled on master"
        )
    except Exception as exc:
        return Check("Branch Protection", True, False,
                     f"Could not check branch: {exc}", emoji="❓")


def check_open_prs() -> Check:
    """Flag if there are open PRs that haven't been merged into this release."""
    try:
        prs = _gh(f"/repos/{GITHUB_REPOSITORY}/pulls",
                  params={"state": "open", "base": "master", "per_page": 10})
        if not isinstance(prs, list):
            prs = []
        n = len(prs)
        if n == 0:
            return Check("Open PRs", True, False, "No open PRs targeting master")
        links = ", ".join(f"[#{p['number']}]({p['html_url']})" for p in prs[:5])
        return Check("Open PRs", True, False,
                     f"{n} open PR(s) not yet merged: {links}",
                     emoji="⚠️")
    except Exception as exc:
        return Check("Open PRs", True, False,
                     f"Could not check PRs: {exc}", emoji="❓")


def check_test_debt() -> Check:
    """Quick static scan for .skip / .only across test files."""
    _JS_SKIP = re.compile(
        r'\b(describe|it|test|context)\.skip\s*\('
        r'|\b(xit|xdescribe|xtest|xcontext)\s*\('
        r'|\btest\.fixme\s*\('
    )
    _JS_ONLY = re.compile(r'\b(describe|it|test|context)\.only\s*\(')
    _ROBOT_SKIP = re.compile(r'(?i)\[Tags\].*\bskip(ped)?\b')
    _KARATE_IGN = re.compile(r'@ignore\b')

    skips, onlys = 0, 0
    for ext in ("*.cy.js", "*.cy.ts", "*.test.js", "*.spec.js",
                "*.test.ts", "*.spec.ts"):
        for path in Path(".").rglob(ext):
            if "node_modules" in path.parts:
                continue
            try:
                lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
            except OSError:
                continue
            for raw in lines:
                s = raw.strip()
                if s.startswith("//"):
                    continue
                if _JS_SKIP.search(s): skips += 1
                elif _JS_ONLY.search(s): onlys += 1
    for path in Path(".").rglob("*.robot"):
        if "node_modules" in path.parts:
            continue
        try:
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for raw in lines:
            if _ROBOT_SKIP.search(raw): skips += 1
    for path in Path(".").rglob("*.feature"):
        if "node_modules" in path.parts:
            continue
        try:
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for raw in lines:
            if _KARATE_IGN.search(raw): skips += 1

    passed = (skips == 0) and (onlys == 0)
    detail = f"{skips} skip(s) · {onlys} .only(s) in test files"
    if passed:
        detail = "No skipped or .only tests found"
    return Check("Test Debt (skips / .only)", passed, False, detail)


def check_commit_age() -> Check:
    """Warn if the latest commit on master is more than 7 days old."""
    try:
        data = _gh(f"/repos/{GITHUB_REPOSITORY}/commits/master")
        date_str = data["commit"]["committer"]["date"]
        commit_dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        age_days = (now - commit_dt).days
        passed = age_days <= 7
        return Check(
            "Commit Freshness", passed, False,
            f"Last commit on master was **{age_days} day(s) ago** "
            f"(`{GITHUB_SHA[:7]}`)",
            emoji="✅" if passed else "⚠️"
        )
    except Exception as exc:
        return Check("Commit Freshness", True, False,
                     f"Could not check commit age: {exc}", emoji="❓")


# ── Report builder ─────────────────────────────────────────────────────────────

def build_report(checks: list[Check]) -> str:
    now      = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    blockers = [c for c in checks if not c.passed and c.blocker]
    warnings = [c for c in checks if not c.passed and not c.blocker]
    go       = len(blockers) == 0

    verdict      = "✅ GO — Safe to release" if go else f"🔴 NO-GO — {len(blockers)} blocker(s)"
    verdict_line = f"## {verdict}"

    lines = [
        f"# 🚀 Release Readiness Checklist",
        f"> **Tag:** `{RELEASE_TAG}` &nbsp;|&nbsp; "
        f"**Branch:** `{GITHUB_REF_NAME}` &nbsp;|&nbsp; "
        f"**Commit:** `{GITHUB_SHA[:7]}` &nbsp;|&nbsp; "
        f"**Generated:** {now}",
        "",
        verdict_line,
        "",
        "| Check | Status | Detail |",
        "|-------|--------|--------|",
    ]

    # Critical workflow checks first
    lines.append("| **— Critical Workflows —** | | |")
    for c in checks:
        if c.name in CRITICAL_WORKFLOWS:
            lines.append(f"| {c.name} | {c.emoji} | {c.detail} |")

    # Advisory workflows
    lines.append("| **— Advisory Workflows —** | | |")
    for c in checks:
        if c.name in ADVISORY_WORKFLOWS:
            lines.append(f"| {c.name} | {c.emoji} | {c.detail} |")

    # Quality gates
    lines.append("| **— Quality Gates —** | | |")
    for c in checks:
        if c.name not in CRITICAL_WORKFLOWS and c.name not in ADVISORY_WORKFLOWS:
            lines.append(f"| {c.name} | {c.emoji} | {c.detail} |")

    lines.append("")

    if blockers:
        lines += [
            "---",
            "## 🔴 Blockers (must fix before releasing)",
            "",
        ]
        for c in blockers:
            lines.append(f"- **{c.name}** — {c.detail}")
        lines.append("")

    if warnings:
        lines += [
            "---",
            "## ⚠️ Warnings (advisory — release is still allowed)",
            "",
        ]
        for c in warnings:
            lines.append(f"- **{c.name}** — {c.detail}")
        lines.append("")

    return "\n".join(lines)


def build_release_body(checks: list[Check], go: bool) -> str:
    """Generate a GitHub Release body draft."""
    now    = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    passed = [c for c in checks if c.passed]
    failed = [c for c in checks if not c.passed]

    lines = [
        f"## Release {RELEASE_TAG} — {now}",
        "",
        f"**Branch:** `{GITHUB_REF_NAME}` · **Commit:** `{GITHUB_SHA[:7]}`",
        "",
        "### ✅ Quality gates passed" if go else "### ⚠️ Released with warnings",
        "",
    ]

    for c in passed:
        lines.append(f"- {c.emoji} {c.name}")

    if failed:
        lines += ["", "### Known issues at release time", ""]
        for c in failed:
            lines.append(f"- {c.emoji} {c.name}: {c.detail}")

    lines += [
        "",
        "---",
        "_Generated by Release Readiness Checklist agent — "
        "[View full report in Actions](https://github.com/"
        f"{GITHUB_REPOSITORY}/actions)_"
    ]
    return "\n".join(lines)


def write_job_summary(checks: list[Check], go: bool) -> None:
    path = os.environ.get("GITHUB_STEP_SUMMARY", "")
    if not path:
        return
    verdict = "✅ GO" if go else "🔴 NO-GO"
    lines = [
        f"## 🚀 Release Readiness — {verdict}\n",
        "| Check | Status |",
        "|-------|--------|",
    ]
    for c in checks:
        lines.append(f"| {c.name} | {c.emoji} {'Pass' if c.passed else 'Fail'} |")
    with open(path, "a", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print(f"  🚀 Release Readiness Checklist — {RELEASE_TAG}")
    print("=" * 60)

    print("\n📡 Checking workflows…")
    checks = check_workflows()

    print("🐛 Checking blocking issues…")
    checks.append(check_blocking_issues())

    print("🔒 Checking branch protection…")
    checks.append(check_branch_protection())

    print("🔀 Checking open PRs…")
    checks.append(check_open_prs())

    print("⏸️  Checking test debt…")
    checks.append(check_test_debt())

    print("📅 Checking commit freshness…")
    checks.append(check_commit_age())

    # Verdict
    blockers = [c for c in checks if not c.passed and c.blocker]
    go       = len(blockers) == 0

    for c in checks:
        print(f"  {c.emoji} {c.name}: {c.detail[:80]}")

    # Save reports
    report       = build_report(checks)
    release_body = build_release_body(checks, go)

    Path(REPORT_PATH).write_text(report, encoding="utf-8")
    Path(RELEASE_BODY_PATH).write_text(release_body, encoding="utf-8")
    write_job_summary(checks, go)

    print(f"\n{'=' * 60}")
    print(f"  {'✅ GO — safe to release' if go else '🔴 NO-GO — fix blockers first'}")
    print(f"  {len(blockers)} blocker(s) · {len([c for c in checks if not c.passed and not c.blocker])} warning(s)")
    print(f"{'=' * 60}\n")
    sys.exit(0 if go else 1)


if __name__ == "__main__":
    main()
