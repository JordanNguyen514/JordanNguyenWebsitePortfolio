#!/usr/bin/env python3
"""
Dead & Skipped Test Auditor — Sandbox Architect
Statically scans all test frameworks for .skip, .only, xit, xdescribe,
@ignore, Robot skip tags. Fails CI if counts exceed thresholds.
Outputs: Markdown report artifact, job summary, PR comment.
"""

import os, re, sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
import requests

GITHUB_TOKEN      = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "")
GITHUB_SHA        = os.environ.get("GITHUB_SHA", "HEAD")
GITHUB_REF_NAME   = os.environ.get("GITHUB_REF_NAME", "master")
PR_NUMBER         = os.environ.get("PR_NUMBER", "")
SKIP_THRESHOLD    = int(os.environ.get("SKIP_THRESHOLD", "0"))
ONLY_THRESHOLD    = int(os.environ.get("ONLY_THRESHOLD", "0"))
REPORT_PATH       = "dead-skipped-test-report.md"

_JS_SKIP = re.compile(
    r'\b(describe|it|test|context)\.skip\s*\('
    r'|\b(xit|xdescribe|xtest|xcontext)\s*\('
    r'|\btest\.fixme\s*\(')
_JS_ONLY    = re.compile(r'\b(describe|it|test|context)\.only\s*\(')
_ROBOT_SKIP = re.compile(r'(?i)\[Tags\].*\bskip(ped)?\b')
_KARATE_IGN = re.compile(r'@ignore\b')

_KIND_EMOJI = {"skip":"⏸️","only":"🔦","pending":"🕐"}

@dataclass
class Finding:
    framework: str; kind: str; file: str; line: int; snippet: str

@dataclass
class FrameworkResult:
    name: str; findings: list = field(default_factory=list); scanned: int = 0

def scan_js(root, globs, framework):
    result = FrameworkResult(name=framework)
    for pattern in globs:
        for path in Path(root).glob(pattern):
            if "node_modules" in path.parts: continue
            result.scanned += 1
            try: lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
            except OSError: continue
            for n, raw in enumerate(lines, 1):
                s = raw.strip()
                if s.startswith("//"): continue
                if _JS_SKIP.search(s):
                    result.findings.append(Finding(framework, "skip", str(path), n, s[:120]))
                elif _JS_ONLY.search(s):
                    result.findings.append(Finding(framework, "only", str(path), n, s[:120]))
    return result

def scan_robot(root="."):
    result = FrameworkResult(name="Robot Framework")
    for path in Path(root).rglob("*.robot"):
        if "node_modules" in path.parts: continue
        result.scanned += 1
        try: lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError: continue
        for n, raw in enumerate(lines, 1):
            if _ROBOT_SKIP.search(raw):
                result.findings.append(Finding("Robot Framework","skip",str(path),n,raw.strip()[:120]))
    return result

def scan_karate(root="."):
    result = FrameworkResult(name="Karate")
    for path in Path(root).rglob("*.feature"):
        if "node_modules" in path.parts: continue
        result.scanned += 1
        try: lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError: continue
        for n, raw in enumerate(lines, 1):
            if _KARATE_IGN.search(raw):
                result.findings.append(Finding("Karate","skip",str(path),n,raw.strip()[:120]))
    return result

def build_report(results):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    all_f = [f for r in results for f in r.findings]
    n_skip = sum(1 for f in all_f if f.kind == "skip")
    n_only = sum(1 for f in all_f if f.kind == "only")
    skip_status = "🔴 FAIL" if n_skip > SKIP_THRESHOLD else "✅ PASS"
    only_status = "🔴 FAIL" if n_only > ONLY_THRESHOLD else "✅ PASS"
    lines = [
        "# 🔍 Dead & Skipped Test Audit",
        f"> {now} · `{GITHUB_SHA[:7]}` · `{GITHUB_REF_NAME}`",
        f"> Thresholds: skips ≤ `{SKIP_THRESHOLD}` · onlys ≤ `{ONLY_THRESHOLD}`","",
        "## Summary","",
        "| Metric | Count | Threshold | Status |",
        "|--------|-------|-----------|--------|",
        f"| ⏸️ Skipped | `{n_skip}` | `{SKIP_THRESHOLD}` | {skip_status} |",
        f"| 🔦 .only | `{n_only}` | `{ONLY_THRESHOLD}` | {only_status} |",
        "","---",""]
    for r in results:
        if not r.scanned: continue
        lines += [f"## {r.name} — {r.scanned} file(s)", ""]
        if not r.findings:
            lines += ["✅ Clean.", ""]; continue
        by_file = {}
        for f in r.findings: by_file.setdefault(f.file,[]).append(f)
        lines += ["| File | Line | Kind | Snippet |",
                  "|------|------|------|---------|"]
        for fp, finds in sorted(by_file.items()):
            short = fp.replace("./","")
            for f in finds:
                lines.append(f"| `{short}` | {f.line} | {_KIND_EMOJI.get(f.kind,'❓')} | `{f.snippet.replace('|','\\|')}` |")
        lines.append("")
    if n_only > 0:
        lines += ["---","","## ⚠️ Why .only in CI creates false-green builds","",
                  "A committed `.only` silently filters your entire suite — only that "
                  "test runs and everything else is invisible to CI.", ""]
    return "\n".join(lines)

def post_pr_comment(body):
    if not PR_NUMBER or not GITHUB_TOKEN: return
    try:
        requests.post(
            f"https://api.github.com/repos/{GITHUB_REPOSITORY}/issues/{PR_NUMBER}/comments",
            headers={"Authorization":f"Bearer {GITHUB_TOKEN}",
                     "Accept":"application/vnd.github+json",
                     "X-GitHub-Api-Version":"2022-11-28"},
            json={"body": body}, timeout=15)
    except Exception as e: print(f"  PR comment failed: {e}")

def write_job_summary(results, n_skip, n_only):
    p = os.environ.get("GITHUB_STEP_SUMMARY","")
    if not p: return
    skip_s = "🔴 FAIL" if n_skip > SKIP_THRESHOLD else "✅ PASS"
    only_s = "🔴 FAIL" if n_only > ONLY_THRESHOLD else "✅ PASS"
    with open(p,"a") as fh:
        fh.write(f"## 🔍 Dead & Skipped Test Audit\n\n"
                 f"| Metric | Count | Status |\n|--------|-------|--------|\n"
                 f"| ⏸️ Skips | {n_skip} | {skip_s} |\n"
                 f"| 🔦 Onlys | {n_only} | {only_s} |\n\n")

def main():
    print("🔍 Dead & Skipped Test Auditor starting…")
    print(f"  Thresholds: skips ≤ {SKIP_THRESHOLD} · onlys ≤ {ONLY_THRESHOLD}")
    results = [
        scan_js(".", ["cypress/e2e/**/*.cy.js","cypress/e2e/**/*.cy.ts"], "Cypress"),
        scan_js(".", ["tests/**/*.test.js","tests/**/*.spec.js",
                      "tests/**/*.test.ts","tests/**/*.spec.ts"], "Jest / Playwright"),
        scan_robot(),
        scan_karate(),
    ]
    for r in results:
        print(f"  {r.name}: {r.scanned} file(s), {len(r.findings)} finding(s)")
    all_f  = [f for r in results for f in r.findings]
    n_skip = sum(1 for f in all_f if f.kind == "skip")
    n_only = sum(1 for f in all_f if f.kind == "only")
    report = build_report(results)
    Path(REPORT_PATH).write_text(report, encoding="utf-8")
    write_job_summary(results, n_skip, n_only)
    if all_f:
        post_pr_comment(report[:65000])
    failed = (n_skip > SKIP_THRESHOLD) or (n_only > ONLY_THRESHOLD)
    print(f"\n{'🔴 FAILED' if failed else '✅ PASSED'} — "
          f"{n_skip} skip(s) / {n_only} only(s)")
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
