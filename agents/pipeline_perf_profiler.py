#!/usr/bin/env python3
"""
Pipeline Performance Profiler — Sandbox Architect
Fetches step timings from the GHA API for the triggering workflow run,
compares against rolling history (stored as GHA artifact), flags regressions,
publishes report to S3/CloudFront and posts PR comment.
"""

import os, io, sys, json, zipfile
from datetime import datetime, timezone
from pathlib import Path
import requests

GITHUB_TOKEN          = os.environ["GITHUB_TOKEN"]
GITHUB_REPOSITORY     = os.environ.get("GITHUB_REPOSITORY", "")
TRIGGERING_RUN_ID     = os.environ.get("TRIGGERING_RUN_ID", "")
TRIGGERING_WORKFLOW   = os.environ.get("TRIGGERING_WORKFLOW", "Unknown")
GITHUB_RUN_ID         = os.environ.get("GITHUB_RUN_ID", "")
PR_NUMBER             = os.environ.get("PR_NUMBER", "")
REGRESSION_THRESHOLD  = float(os.environ.get("REGRESSION_THRESHOLD", "25"))
MIN_RUNS_FOR_BASELINE = int(os.environ.get("MIN_RUNS_FOR_BASELINE", "3"))
TOP_N_STEPS           = int(os.environ.get("TOP_N_STEPS", "10"))
FAIL_ON_REGRESSION    = os.environ.get("FAIL_ON_REGRESSION","false").lower()=="true"

HISTORY_ARTIFACT_NAME = "pipeline-perf-history"
HISTORY_PATH          = "pipeline-perf-history.json"
REPORT_PATH           = "pipeline-perf-report.md"

_GH = "https://api.github.com"
_GH_H = {"Authorization": f"Bearer {GITHUB_TOKEN}",
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"}

def _gh(method, path, **kw):
    r = requests.request(method, f"{_GH}{path}", headers=_GH_H, **kw)
    r.raise_for_status(); return r.json() if r.content else {}

def _gh_raw(path, **kw):
    r = requests.get(f"{_GH}{path}", headers=_GH_H, **kw)
    r.raise_for_status(); return r

def load_history():
    try:
        data = _gh("GET", f"/repos/{GITHUB_REPOSITORY}/actions/artifacts",
                   params={"name": HISTORY_ARTIFACT_NAME, "per_page": 1})
        arts = data.get("artifacts", [])
        if not arts: print("  No prior history — starting fresh."); return {}
        resp = _gh_raw(f"/repos/{GITHUB_REPOSITORY}/actions/artifacts/{arts[0]['id']}/zip",
                       allow_redirects=True)
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            with zf.open(HISTORY_PATH) as fh:
                h = json.load(fh); print(f"  History: {len(h)} step(s)."); return h
    except Exception as e:
        print(f"  No history ({e}) — starting fresh."); return {}

def save_history(history):
    Path(HISTORY_PATH).write_text(json.dumps(history, indent=2))

def fetch_step_timings(run_id):
    if not run_id: print("  No TRIGGERING_RUN_ID."); return []
    try:
        data = _gh("GET", f"/repos/{GITHUB_REPOSITORY}/actions/runs/{run_id}/jobs",
                   params={"per_page": 100})
    except Exception as e:
        print(f"  Failed to fetch jobs: {e}"); return []
    steps = []
    for job in data.get("jobs", []):
        for step in job.get("steps", []):
            s, c = step.get("started_at"), step.get("completed_at")
            if not s or not c: continue
            try:
                t0 = datetime.fromisoformat(s.replace("Z","+00:00"))
                t1 = datetime.fromisoformat(c.replace("Z","+00:00"))
                dur = max(0.0, (t1-t0).total_seconds())
            except ValueError: continue
            steps.append({"job": job.get("name","?"), "step": step.get("name","?"),
                           "duration_s": dur, "conclusion": step.get("conclusion","?")})
    return steps

def update_history(history, steps, run_id):
    now = datetime.now(timezone.utc).isoformat()
    for s in steps:
        key = f"{s['job']} / {s['step']}"
        if key not in history: history[key] = {"runs":[]}
        history[key]["runs"].append({"run_id":run_id,"date":now,"duration_s":s["duration_s"]})
        history[key]["runs"] = history[key]["runs"][-50:]
    return history

def baseline(runs):
    prior = runs[:-1]
    if len(prior) < MIN_RUNS_FOR_BASELINE: return None
    return sum(r["duration_s"] for r in prior) / len(prior)

def analyse(steps, history):
    enriched = []
    for s in steps:
        key  = f"{s['job']} / {s['step']}"
        runs = history.get(key,{}).get("runs",[])
        base = baseline(runs)
        if base and base > 0:
            delta = ((s["duration_s"]-base)/base)*100
            regressed = delta >= REGRESSION_THRESHOLD
        else:
            delta, regressed = None, False
        enriched.append({**s,"key":key,"baseline":base,"delta_pct":delta,"regressed":regressed})
    return sorted(enriched, key=lambda x: -x["duration_s"])

def fmt_s(v):
    if v is None: return "—"
    if v < 60: return f"{v:.1f}s"
    m,s = divmod(int(v),60); return f"{m}m {s:02d}s"

def fmt_delta(v):
    if v is None: return "—"
    return f"+{v:.0f}%" if v >= 0 else f"{v:.0f}%"

def build_report(enriched, total_s):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    regressions = [s for s in enriched if s["regressed"]]
    lines = [
        "# ⏱️ Pipeline Performance Profiler",
        f"> **Workflow:** {TRIGGERING_WORKFLOW} · **Run:** [{TRIGGERING_RUN_ID}]"
        f"(https://github.com/{GITHUB_REPOSITORY}/actions/runs/{TRIGGERING_RUN_ID})",
        f"> {now}","",
        "## Summary","",
        "| Wall time | Steps | Regressions |",
        "|-----------|-------|-------------|",
        f"| {fmt_s(total_s)} | {len(enriched)} | {len(regressions)} |","",
        f"## 🐢 Top {TOP_N_STEPS} Slowest Steps","",
        "| Job / Step | Duration | Baseline | Δ | 🚦 |",
        "|-----------|----------|----------|---|---|"]
    for s in enriched[:TOP_N_STEPS]:
        icon = "🔴" if s["regressed"] else ("🆕" if s["delta_pct"] is None else "⚪")
        lines.append(f"| `{s['key']}` | `{fmt_s(s['duration_s'])}` "
                     f"| `{fmt_s(s['baseline'])}` | {fmt_delta(s['delta_pct'])} | {icon} |")
    lines.append("")
    if regressions:
        lines += ["## 🔴 Regressions","",
                  "| Job / Step | Now | Baseline | Slowdown |",
                  "|-----------|-----|----------|---------|"]
        for s in regressions:
            lines.append(f"| `{s['key']}` | `{fmt_s(s['duration_s'])}` "
                         f"| `{fmt_s(s['baseline'])}` | **{fmt_delta(s['delta_pct'])}** |")
        lines.append("")
    else:
        lines += ["## ✅ No Regressions",""]
    return "\n".join(lines)

_MARKER = "<!-- pipeline-perf-profiler -->"

def upsert_pr_comment(enriched, regressions, total_s):
    if not PR_NUMBER: return
    body = (f"{_MARKER}\n## ⏱️ Pipeline Performance Profiler\n\n"
            f"**{TRIGGERING_WORKFLOW}** · Wall time: `{fmt_s(total_s)}` · "
            f"Regressions: `{len(regressions)}`\n\n"
            "| Step | Duration | Δ |\n|------|----------|---|\n"
            + "\n".join(f"| `{s['key']}` | `{fmt_s(s['duration_s'])}` | {fmt_delta(s['delta_pct'])} |"
                        for s in enriched[:5]))
    base = f"https://api.github.com/repos/{GITHUB_REPOSITORY}"
    try:
        r = requests.get(f"{base}/issues/{PR_NUMBER}/comments?per_page=100",
                         headers=_GH_H, timeout=15); r.raise_for_status()
        existing = next((c["id"] for c in r.json() if _MARKER in c.get("body","")), None)
        if existing: requests.patch(f"{base}/issues/comments/{existing}",
                                    headers=_GH_H, json={"body":body}, timeout=15)
        else:        requests.post(f"{base}/issues/{PR_NUMBER}/comments",
                                   headers=_GH_H, json={"body":body}, timeout=15)
    except Exception as e: print(f"  PR comment failed: {e}")

def write_job_summary(enriched, regressions, total_s):
    p = os.environ.get("GITHUB_STEP_SUMMARY","")
    if not p: return
    with open(p,"a") as fh:
        fh.write(f"## ⏱️ Pipeline Performance Profiler\n\n"
                 f"| Wall time | Steps | Regressions |\n|-----------|-------|-------------|\n"
                 f"| {fmt_s(total_s)} | {len(enriched)} | {len(regressions)} |\n\n")

def main():
    print(f"⏱️  Pipeline Performance Profiler — run {TRIGGERING_RUN_ID}")
    print("  Loading history…")
    history = load_history()
    print("  Fetching step timings…")
    steps = fetch_step_timings(TRIGGERING_RUN_ID)
    if not steps:
        Path(REPORT_PATH).write_text("# ⏱️ Pipeline Profiler\n\nNo steps found.\n")
        sys.exit(0)
    print(f"  {len(steps)} step(s) found.")
    history = update_history(history, steps, TRIGGERING_RUN_ID)
    enriched = analyse(steps, history)
    regressions = [s for s in enriched if s["regressed"]]
    total_s = sum(s["duration_s"] for s in steps)
    print(f"  {len(regressions)} regression(s).")
    save_history(history)
    report = build_report(enriched, total_s)
    Path(REPORT_PATH).write_text(report, encoding="utf-8")
    write_job_summary(enriched, regressions, total_s)
    upsert_pr_comment(enriched, regressions, total_s)
    print(f"✅ Done.")
    sys.exit(1 if (regressions and FAIL_ON_REGRESSION) else 0)

if __name__ == "__main__":
    main()
