#!/usr/bin/env python3
"""
Cypress Log Analyst — Sandbox Architect
Parses Cypress Mochawesome JSON results, classifies AssertionError/CypressError
failures using Claude tool-use, generates patches, opens auto-fix PRs, posts
PR comments, sends Slack messages, and saves a Markdown CI artifact.

Secrets required: ANTHROPIC_API_KEY, GITHUB_TOKEN, SLACK_WEBHOOK_URL (optional)
"""

import os, io, sys, json, glob, base64, zipfile
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import requests

# ── Environment ───────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY  = os.environ["ANTHROPIC_API_KEY"]
GITHUB_TOKEN       = os.environ.get("GITHUB_TOKEN", "")
SLACK_WEBHOOK_URL  = os.environ.get("SLACK_WEBHOOK_URL", "")
GITHUB_REPOSITORY  = os.environ.get("GITHUB_REPOSITORY", "")
PR_NUMBER          = os.environ.get("PR_NUMBER", "")
GITHUB_SHA         = os.environ.get("GITHUB_SHA", "HEAD")
GITHUB_REF_NAME    = os.environ.get("GITHUB_REF_NAME", "master")
CYPRESS_RESULTS_DIR = os.environ.get("CYPRESS_RESULTS_DIR", "cypress/results")

REPORT_PATH       = "cypress-analyst-report.md"
FIX_BRANCH_PREFIX = "fix/cypress-auto"
MODEL             = "claude-opus-4-5"
TARGET_ERRORS     = ("AssertionError", "CypressError")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

TOOLS = [
    {"name": "read_test_file",
     "description": "Read a Cypress test file from the repository.",
     "input_schema": {"type": "object",
                      "properties": {"file_path": {"type": "string"}},
                      "required": ["file_path"]}},
    {"name": "classify_failure",
     "description": "Classify a Cypress test failure and assess patchability.",
     "input_schema": {"type": "object",
                      "properties": {
                          "error_type": {"type": "string",
                                         "enum": ["AssertionError","CypressError",
                                                  "TimeoutError","NetworkError","UnknownError"]},
                          "patchable":  {"type": "boolean"},
                          "root_cause": {"type": "string"},
                          "confidence": {"type": "string", "enum": ["high","medium","low"]}},
                      "required": ["error_type","patchable","root_cause","confidence"]}},
    {"name": "generate_patch",
     "description": "Generate a code patch for a patchable Cypress failure.",
     "input_schema": {"type": "object",
                      "properties": {
                          "file_path":     {"type": "string"},
                          "original_code": {"type": "string"},
                          "patched_code":  {"type": "string"},
                          "explanation":   {"type": "string"}},
                      "required": ["file_path","original_code","patched_code","explanation"]}}
]

SYSTEM_PROMPT = """You are an expert Cypress E2E failure analyst.
Workflow per failure: read_test_file → classify_failure → generate_patch (if patchable).
Only set patchable=true for deterministic fixes: stale selector, wrong assertion value, typo.
Never patch timing or network issues."""

_GH = "https://api.github.com"
_GH_H = {"Authorization": f"Bearer {GITHUB_TOKEN}",
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"}

def _gh(method, path, **kw):
    r = requests.request(method, f"{_GH}{path}", headers=_GH_H, **kw)
    r.raise_for_status(); return r.json() if r.content else {}

def fetch_file(fp):
    try:
        d = _gh("GET", f"/repos/{GITHUB_REPOSITORY}/contents/{fp}?ref={GITHUB_SHA}")
        return base64.b64decode(d["content"]).decode(), d["sha"]
    except: return f"# ERROR reading {fp}", None

def load_failures():
    failures = []
    for path in glob.glob(f"{CYPRESS_RESULTS_DIR}/**/*.json", recursive=True):
        try: data = json.load(open(path))
        except: continue
        for suite in data.get("results", []):
            spec = suite.get("file", path)
            for test in _walk_tests(suite.get("suites", [])):
                if test.get("pass") or not test.get("err"): continue
                err = test["err"]
                msg = err.get("message","")
                if not any(t in msg for t in TARGET_ERRORS): continue
                failures.append({"spec": spec, "title": test.get("fullTitle","?"),
                                  "error_message": msg,
                                  "error_stack": err.get("estack","")[:2000]})
    return failures

def _walk_tests(suites):
    out = []
    for s in suites:
        out.extend(s.get("tests",[])); out.extend(_walk_tests(s.get("suites",[])))
    return out

def execute_tool(name, inp, patches, cache):
    if name == "read_test_file":
        fp = inp["file_path"]
        if fp not in cache: cache[fp] = fetch_file(fp)
        return cache[fp][0]
    if name == "classify_failure": return json.dumps(inp)
    if name == "generate_patch":   patches.append(inp); return json.dumps({"status":"queued"})
    return json.dumps({"error": f"unknown tool {name}"})

def analyse_failure(failure):
    patches, classification, cache = [], {}, {}
    messages = [{"role":"user","content":
        f"Spec: `{failure['spec']}`\nTest: {failure['title']}\n"
        f"Error:\n```\n{failure['error_message']}\n```\nStack:\n```\n{failure['error_stack']}\n```\n"
        f"Follow the workflow: read_test_file → classify_failure → generate_patch if patchable."}]
    while True:
        resp = client.messages.create(model=MODEL, max_tokens=4096,
                                       system=SYSTEM_PROMPT, tools=TOOLS, messages=messages)
        messages.append({"role":"assistant","content": resp.content})
        if resp.stop_reason != "tool_use": break
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input, patches, cache)
                if block.name == "classify_failure": classification = block.input
                results.append({"type":"tool_result","tool_use_id":block.id,"content":result})
        messages.append({"role":"user","content": results})
    summary = next((b.text for b in resp.content if hasattr(b,"text") and b.text.strip()), "")
    return {"failure":failure,"classification":classification,"patches":patches,"summary":summary,"cache":cache}

def apply_patches(analyses):
    patchable = [a for a in analyses if a["patches"]]
    if not patchable or not GITHUB_TOKEN: return []
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    branch = f"{FIX_BRANCH_PREFIX}/{ts}"
    try: _gh("POST",f"/repos/{GITHUB_REPOSITORY}/git/refs",
              json={"ref":f"refs/heads/{branch}","sha":GITHUB_SHA})
    except Exception as e: print(f"  Branch create failed: {e}"); return []
    committed = set()
    pr_body = ["Auto-generated by Cypress Log Analyst.\n"]
    for a in patchable:
        for p in a["patches"]:
            fp = p["file_path"]
            if fp in committed: continue
            content, sha = fetch_file(fp)
            if sha is None: continue
            new = content.replace(p["original_code"], p["patched_code"], 1)
            if new == content: print(f"  Patch for {fp} didn't match — skipping"); continue
            try:
                _gh("PUT",f"/repos/{GITHUB_REPOSITORY}/contents/{fp}",
                    json={"message":f"fix(cypress): auto-patch {fp}",
                          "content":base64.b64encode(new.encode()).decode(),
                          "sha":sha,"branch":branch})
                committed.add(fp)
                pr_body.append(f"### `{fp}`\n{p['explanation']}\n")
            except Exception as e: print(f"  Commit failed for {fp}: {e}")
    if not committed: return []
    try:
        pr = _gh("POST",f"/repos/{GITHUB_REPOSITORY}/pulls",
                  json={"title":f"fix(cypress): auto-patch {len(committed)} spec(s)",
                        "head":branch,"base":GITHUB_REF_NAME,"body":"\n".join(pr_body)})
        return [pr["html_url"]]
    except Exception as e: print(f"  PR failed: {e}"); return []

def build_report(analyses, pr_urls):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"# 🧪 Cypress Log Analyst Report",
             f"> {now} · `{GITHUB_SHA[:7]}` · `{GITHUB_REF_NAME}`","",
             f"## Summary","",
             f"| Failures | Auto-patched | PRs |",
             f"|----------|--------------|-----|",
             f"| {len(analyses)} | {sum(1 for a in analyses if a['patches'])} | {len(pr_urls)} |",""]
    for i,a in enumerate(analyses,1):
        f,c = a["failure"], a.get("classification",{})
        em = {"AssertionError":"🔴","CypressError":"🟠"}.get(c.get("error_type",""),"❓")
        lines += [f"### {i}. {em} `{f['title']}`",
                  f"**Root cause:** {c.get('root_cause','—')}","",
                  "<details><summary>Agent summary</summary>","",
                  a.get("summary","_none_"),"","</details>",""]
    if pr_urls: lines += ["## Auto-fix PRs",""] + [f"- {u}" for u in pr_urls]
    return "\n".join(lines)

def post_pr_comment(body):
    if not PR_NUMBER: return
    try: _gh("POST",f"/repos/{GITHUB_REPOSITORY}/issues/{PR_NUMBER}/comments",json={"body":body})
    except Exception as e: print(f"  PR comment failed: {e}")

def post_slack(text):
    if not SLACK_WEBHOOK_URL: return
    requests.post(SLACK_WEBHOOK_URL, json={"text":text}, timeout=10)

def main():
    print("🔍 Cypress Log Analyst starting…")
    failures = load_failures()
    if not failures:
        Path(REPORT_PATH).write_text("# ✅ No targeted Cypress failures.\n")
        sys.exit(0)
    print(f"  {len(failures)} failure(s) found. Analysing…")
    analyses = []
    for i,f in enumerate(failures,1):
        print(f"  [{i}/{len(failures)}] {f['title']}")
        try: analyses.append(analyse_failure(f))
        except Exception as e:
            print(f"  Error: {e}")
            analyses.append({"failure":f,"classification":{},"patches":[],"summary":str(e),"cache":{}})
    pr_urls = apply_patches(analyses)
    report = build_report(analyses, pr_urls)
    Path(REPORT_PATH).write_text(report)
    post_pr_comment(report[:65000])
    post_slack(f"Cypress Analyst: {len(failures)} failure(s) on `{GITHUB_REF_NAME}`")
    print(f"✅ Done. {len(pr_urls)} PR(s) opened.")
    sys.exit(1 if any(not a["patches"] for a in analyses) else 0)

if __name__ == "__main__":
    main()
