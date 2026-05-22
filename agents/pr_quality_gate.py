#!/usr/bin/env python3
"""
PR Quality Gate — Sandbox Architect
Checks on every PR: Jest coverage thresholds, skipped/only tests,
conventional commit format. Posts a single upserted PR comment.
Exits 1 if any check fails.
"""

import os, re, sys
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime, timezone
import requests

GITHUB_TOKEN       = os.environ["GITHUB_TOKEN"]
GITHUB_REPOSITORY  = os.environ.get("GITHUB_REPOSITORY", "")
GITHUB_SHA         = os.environ.get("GITHUB_SHA", "HEAD")
GITHUB_REF_NAME    = os.environ.get("GITHUB_REF_NAME", "master")
PR_NUMBER          = os.environ.get("PR_NUMBER", "")
COVERAGE_LINES     = float(os.environ.get("COVERAGE_LINES",     "70"))
COVERAGE_FUNCTIONS = float(os.environ.get("COVERAGE_FUNCTIONS", "70"))
COVERAGE_BRANCHES  = float(os.environ.get("COVERAGE_BRANCHES",  "60"))
SKIP_THRESHOLD     = int(os.environ.get("SKIP_THRESHOLD",       "0"))
ONLY_THRESHOLD     = int(os.environ.get("ONLY_THRESHOLD",       "0"))
ENFORCE_COMMITS    = os.environ.get("ENFORCE_COMMITS", "true").lower() == "true"
LCOV_PATH          = os.environ.get("LCOV_PATH", "coverage/lcov.info")
REPORT_PATH        = "pr-quality-gate-report.md"

_CC = re.compile(
    r'^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)'
    r'(\([a-z0-9_/-]+\))?(!)?'
    r': .{1,100}$', re.IGNORECASE)

_JS_SKIP = re.compile(
    r'\b(describe|it|test|context)\.skip\s*\('
    r'|\b(xit|xdescribe|xtest|xcontext)\s*\('
    r'|\btest\.fixme\s*\(')
_JS_ONLY    = re.compile(r'\b(describe|it|test|context)\.only\s*\(')
_ROBOT_SKIP = re.compile(r'(?i)\[Tags\].*\bskip(ped)?\b')
_KARATE_IGN = re.compile(r'@ignore\b')

_GH_H = {"Authorization": f"Bearer {GITHUB_TOKEN}",
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"}

@dataclass
class Check:
    name: str; passed: bool; detail: str; full: str = ""

# ── 1. Coverage ───────────────────────────────────────────────────────────────
def parse_lcov(path):
    p = Path(path)
    if not p.exists(): return {"lines":None,"functions":None,"branches":None}
    lf=lh=fnf=fnh=brf=brh=0
    for line in p.read_text(encoding="utf-8",errors="replace").splitlines():
        if   line.startswith("LF:"):  lf +=int(line[3:])
        elif line.startswith("LH:"):  lh +=int(line[3:])
        elif line.startswith("FNF:"): fnf+=int(line[4:])
        elif line.startswith("FNH:"): fnh+=int(line[4:])
        elif line.startswith("BRF:"): brf+=int(line[4:])
        elif line.startswith("BRH:"): brh+=int(line[4:])
    return {"lines":     round(lh /lf *100,1) if lf  else None,
            "functions": round(fnh/fnf*100,1) if fnf else None,
            "branches":  round(brh/brf*100,1) if brf else None}

def check_coverage():
    cov = parse_lcov(LCOV_PATH)
    if cov["lines"] is None:
        return Check("Jest Coverage", False,
                     f"`{LCOV_PATH}` not found — run `npm run test:unit:coverage`")
    rows, ok = [], True
    for metric, actual, threshold in [
        ("Lines",     cov["lines"],     COVERAGE_LINES),
        ("Functions", cov["functions"], COVERAGE_FUNCTIONS),
        ("Branches",  cov["branches"],  COVERAGE_BRANCHES)]:
        if actual is None: rows.append(f"| {metric} | n/a | {threshold}% | ⚠️ |"); continue
        passed = actual >= threshold
        if not passed: ok = False
        rows.append(f"| {metric} | {actual}% | {threshold}% | {'✅' if passed else '🔴'} |")
    full = "| Metric | Actual | Threshold | Status |\n|--------|--------|-----------|--------|\n" + "\n".join(rows)
    return Check("Jest Coverage", ok,
                 f"Lines {cov['lines']}% / Functions {cov['functions']}% / Branches {cov['branches']}%",
                 full)

# ── 2. Skipped/only ───────────────────────────────────────────────────────────
def check_skipped_tests():
    skips, onlys = [], []
    for ext in ("*.cy.js","*.cy.ts","*.test.js","*.spec.js","*.test.ts","*.spec.ts"):
        for path in Path(".").rglob(ext):
            if "node_modules" in path.parts: continue
            try: lines = path.read_text(encoding="utf-8",errors="replace").splitlines()
            except OSError: continue
            for n, raw in enumerate(lines, 1):
                s = raw.strip()
                if s.startswith("//"): continue
                if _JS_SKIP.search(s): skips.append(f"`{path}:{n}` `{s[:70]}`")
                elif _JS_ONLY.search(s): onlys.append(f"`{path}:{n}` `{s[:70]}`")
    for path in Path(".").rglob("*.robot"):
        if "node_modules" in path.parts: continue
        try: lines = path.read_text(encoding="utf-8",errors="replace").splitlines()
        except OSError: continue
        for n, raw in enumerate(lines, 1):
            if _ROBOT_SKIP.search(raw): skips.append(f"`{path}:{n}` `{raw.strip()[:70]}`")
    for path in Path(".").rglob("*.feature"):
        if "node_modules" in path.parts: continue
        try: lines = path.read_text(encoding="utf-8",errors="replace").splitlines()
        except OSError: continue
        for n, raw in enumerate(lines, 1):
            if _KARATE_IGN.search(raw): skips.append(f"`{path}:{n}` `{raw.strip()[:70]}`")
    passed = len(skips) <= SKIP_THRESHOLD and len(onlys) <= ONLY_THRESHOLD
    parts = []
    if skips: parts.append("**Skipped:**\n" + "\n".join(f"- {s}" for s in skips[:10]))
    if onlys: parts.append("**`.only` (blocks entire suite in CI):**\n"
                            + "\n".join(f"- {o}" for o in onlys[:10]))
    return Check("Skipped & .only Tests", passed,
                 f"{len(skips)} skip(s) ≤{SKIP_THRESHOLD} · {len(onlys)} .only(s) ≤{ONLY_THRESHOLD}",
                 "\n\n".join(parts) if parts else "No issues.")

# ── 3. Conventional commits ────────────────────────────────────────────────────
def check_conventional_commits():
    if not ENFORCE_COMMITS:
        return Check("Conventional Commits", True, "Skipped (ENFORCE_COMMITS=false)")
    if not PR_NUMBER:
        return Check("Conventional Commits", True, "No PR_NUMBER — skipped")
    try:
        r = requests.get(
            f"https://api.github.com/repos/{GITHUB_REPOSITORY}/pulls/{PR_NUMBER}/commits?per_page=100",
            headers=_GH_H, timeout=15)
        r.raise_for_status()
        commits = [{"sha":c["sha"][:7],"message":c["commit"]["message"].splitlines()[0]}
                   for c in r.json()]
    except Exception as e:
        return Check("Conventional Commits", True, f"Could not fetch commits: {e}")
    bad = [c for c in commits if not _CC.match(c["message"])]
    lines = []
    if bad:
        lines.append("**Non-conforming:**")
        for c in bad: lines.append(f"- `{c['sha']}` — {c['message']}")
        lines.append("\n**Format:** `type(scope): description`  \n"
                     "Types: `feat` `fix` `chore` `docs` `test` `ci` `refactor` `perf` `style` `revert`")
    return Check("Conventional Commits", len(bad)==0,
                 f"{len(bad)} non-conforming / {len(commits)} commit(s)",
                 "\n".join(lines) if lines else "All commits follow Conventional Commits 1.0.")

# ── Report ─────────────────────────────────────────────────────────────────────
def build_report(results):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    all_pass = all(r.passed for r in results)
    verdict = "✅ All checks passed — ready to merge" if all_pass else "🔴 Checks failed — merge blocked"
    lines = [f"# 🚦 PR Quality Gate",f"> **{verdict}**",
             f"> {now} · `{GITHUB_SHA[:7]}` · `{GITHUB_REF_NAME}`","",
             "| Check | Status | Detail |","|-------|--------|--------|"]
    for r in results:
        lines.append(f"| **{r.name}** | {'✅ Pass' if r.passed else '🔴 Fail'} | {r.detail} |")
    lines.append("")
    for r in results:
        if r.full:
            lines += ["<details>",
                      f"<summary>{'✅' if r.passed else '🔴'} {r.name} — details</summary>",
                      "", r.full, "", "</details>", ""]
    return "\n".join(lines)

_MARKER = "<!-- pr-quality-gate -->"

def upsert_pr_comment(body):
    if not PR_NUMBER: return
    full = f"{_MARKER}\n{body}"
    base = f"https://api.github.com/repos/{GITHUB_REPOSITORY}"
    try:
        r = requests.get(f"{base}/issues/{PR_NUMBER}/comments?per_page=100",
                         headers=_GH_H, timeout=15)
        r.raise_for_status()
        existing = next((c["id"] for c in r.json() if _MARKER in c.get("body","")), None)
        if existing:
            requests.patch(f"{base}/issues/comments/{existing}",
                           headers=_GH_H, json={"body":full}, timeout=15)
        else:
            requests.post(f"{base}/issues/{PR_NUMBER}/comments",
                          headers=_GH_H, json={"body":full}, timeout=15)
    except Exception as e: print(f"  PR comment failed: {e}")

def write_job_summary(results):
    p = os.environ.get("GITHUB_STEP_SUMMARY","")
    if not p: return
    lines = ["## 🚦 PR Quality Gate\n","| Check | Status |","|-------|--------|"]
    for r in results:
        lines.append(f"| {r.name} | {'✅ Pass' if r.passed else '🔴 Fail'} |")
    with open(p,"a") as fh: fh.write("\n".join(lines)+"\n")

def main():
    print("🚦 PR Quality Gate starting…")
    results = []
    for label, fn in [("Coverage", check_coverage),
                      ("Skips",    check_skipped_tests),
                      ("Commits",  check_conventional_commits)]:
        print(f"  Running {label}…")
        r = fn(); results.append(r)
        print(f"  {'✅ PASS' if r.passed else '🔴 FAIL'} — {r.detail}")
    report = build_report(results)
    Path(REPORT_PATH).write_text(report, encoding="utf-8")
    write_job_summary(results)
    upsert_pr_comment(report)
    all_pass = all(r.passed for r in results)
    print(f"\n{'✅ ALL PASSED' if all_pass else '🔴 GATE FAILED'}")
    sys.exit(0 if all_pass else 1)

if __name__ == "__main__":
    main()
