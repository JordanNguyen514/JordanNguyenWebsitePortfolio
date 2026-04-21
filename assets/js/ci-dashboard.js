/**
 * ============================================================
 *  assets/js/ci-dashboard.js
 *
 *  Single source of truth for both:
 *    1. Live Pipeline Status cards  (#ci-dashboard-grid)
 *    2. QA Metrics stat cards       (#m-total, #m-pass, etc.)
 *
 *  Both read from /ci-status/dashboard.json written to S3
 *  after every GitHub Actions workflow run completes.
 *
 *  CONCEPT — Why derive metrics from CI rather than hardcode?
 *  ──────────────────────────────────────────────────────────
 *  Hardcoded numbers go stale immediately. By reading from
 *  the same JSON the pipeline writes, every deploy that runs
 *  tests automatically updates the public-facing metrics.
 * ============================================================
 */

(function () {
  'use strict';

  const DASHBOARD_URL = '/ci-status/dashboard.json';
  const FALLBACK_URL  = '/assets/data/ci-dashboard-local.json';
  const LOCAL_HOSTS   = new Set(['localhost', '127.0.0.1', '::1']);
  const REFRESH_MS    = 30000;

  const WORKFLOW_CONFIG = {
    'deploy':      { label: 'Deploy to S3',              icon: 'u2601ufe0f',  category: 'deploy'   },
    'cypress-e2e': { label: 'Cypress E2E',                icon: '\uD83C\uDF32', category: 'test'     },
    'playwright':  { label: 'Playwright (Cross-Browser)', icon: '\uD83C\uDFAD', category: 'test'     },
    'robot':       { label: 'Robot Framework',            icon: '\uD83E\uDD16', category: 'test'     },
    'karate':      { label: 'Karate API Tests',           icon: '\uD83E\uDD4B', category: 'test'     },
    'lighthouse':  { label: 'Lighthouse CI',              icon: '\uD83D\uDD26', category: 'quality'  },
    'mutation':    { label: 'Mutation Testing',           icon: '\uD83E\uDDEC', category: 'quality'  },
    'security':    { label: 'Security (Snyk + OWASP)',    icon: '\uD83D\uDD12', category: 'security' },
    'synthetics':  { label: 'API Synthetics',             icon: '\uD83D\uDCE1', category: 'quality'  },
  };

  const STATUS_MAP = {
    success:   { badge: 'passing',   cssClass: 'ci-passing',   icon: '\u2705' },
    failure:   { badge: 'failing',   cssClass: 'ci-failing',   icon: '\u274C' },
    cancelled: { badge: 'cancelled', cssClass: 'ci-cancelled', icon: '\u26A0\uFE0F' },
    skipped:   { badge: 'skipped',   cssClass: 'ci-skipped',   icon: '\u23ED\uFE0F' },
    unknown:   { badge: 'unknown',   cssClass: 'ci-unknown',   icon: '\u23F3' },
  };

  function getStatus(c) { return STATUS_MAP[c] || STATUS_MAP.unknown; }
  function isLocal() { return LOCAL_HOSTS.has(window.location.hostname); }
  function bust(url) { return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(); }

  function timeAgo(iso) {
    if (!iso) return '---';
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60)    return 'just now';
    if (s < 3600)  return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  // ── 1. PIPELINE CARDS ─────────────────────────────────────────────────────
  function renderCard(id, wf) {
    var cfg = WORKFLOW_CONFIG[id] || { label: id, icon: '', category: 'other' };
    var st  = getStatus(wf ? wf.conclusion : null);
    var url = wf ? wf.runUrl : '#';

    var testLine = '';
    if (wf && wf.testsTotal > 0) {
      var pct = Math.round((wf.testsPassed / wf.testsTotal) * 100);
      testLine = '<div class="ci-card-tests"><span class="ci-tests-passed">' +
        wf.testsPassed + '/' + wf.testsTotal + '</span>' +
        '<span class="ci-tests-pct"> (' + pct + '%)</span></div>';
    }

    return '<a href="' + url + '" target="_blank" rel="noopener" ' +
      'class="ci-card ' + st.cssClass + '" data-workflow="' + id + '">' +
      '<div class="ci-card-header">' +
        '<span class="ci-card-icon">' + cfg.icon + '</span>' +
        '<span class="ci-card-name">' + cfg.label + '</span>' +
      '</div>' +
      '<div class="ci-card-status">' +
        '<span class="ci-status-icon">' + st.icon + '</span>' +
        '<span class="ci-status-badge">' + st.badge + '</span>' +
      '</div>' +
      testLine +
      '<div class="ci-card-meta">' +
        (wf ? '<span class="ci-run-number">#' + wf.runNumber + '</span>' : '') +
        (wf && wf.commitSha ? '<span class="ci-commit">' + wf.commitSha + '</span>' : '') +
        '<span class="ci-updated">' + timeAgo(wf ? wf.updatedAt : null) + '</span>' +
      '</div>' +
    '</a>';
  }

  function renderPipelineCards(data) {
    var grid = document.getElementById('ci-dashboard-grid');
    if (!grid) return;

    var wfs = data.workflows || {};
    grid.innerHTML = Object.keys(WORKFLOW_CONFIG)
      .map(function(id) { return renderCard(id, wfs[id] || null); })
      .join('');

    var all = Object.values(wfs);
    var failCount = all.filter(function(w) { return w.conclusion === 'failure'; }).length;
    var healthEl = document.getElementById('ci-pipeline-health');
    if (healthEl) {
      if (all.length === 0) {
        healthEl.textContent = 'Awaiting first run';
        healthEl.className = 'ci-health-passing';
      } else if (failCount === 0) {
        healthEl.textContent = 'All pipelines passing';
        healthEl.className = 'ci-health-passing';
      } else {
        healthEl.textContent = failCount + ' pipeline' + (failCount > 1 ? 's' : '') + ' failing';
        healthEl.className = 'ci-health-failing';
      }
    }

    var lastUpdEl = document.getElementById('ci-last-updated');
    if (lastUpdEl && data.lastUpdated) {
      lastUpdEl.textContent = 'Updated ' + timeAgo(data.lastUpdated);
    }
  }

  // ── 2. QA METRICS CARDS ───────────────────────────────────────────────────
  // Derives live numbers from dashboard.json — same file pipeline writes.
  //
  // Total tests  = sum testsTotal  across test-category workflows
  // Pass rate    = sum(testsPassed) / sum(testsTotal) * 100
  // Pipeline runs= highest runNumber across all workflows
  // Avg runtime  = mean durationSecs of test workflows
  function updateQAMetrics(data) {
    var wfs = data.workflows || {};
    var testWfs = Object.values(wfs).filter(function(w) {
      return w.category === 'test' && w.testsTotal > 0;
    });

    var totalTests  = testWfs.reduce(function(s, w) { return s + (w.testsTotal  || 0); }, 0);
    var totalPassed = testWfs.reduce(function(s, w) { return s + (w.testsPassed || 0); }, 0);
    var totalFailed = testWfs.reduce(function(s, w) { return s + (w.testsFailed || 0); }, 0);
    var passRate    = totalTests > 0 ? Math.round(totalPassed / totalTests * 100) : null;

    var maxRun = Math.max.apply(null,
      [0].concat(Object.values(wfs).map(function(w) { return w.runNumber || 0; }))
    );

    var runtimes = testWfs.map(function(w) { return w.durationSecs || 0; }).filter(Boolean);
    var avgSecs  = runtimes.length > 0
      ? Math.round(runtimes.reduce(function(a, b) { return a + b; }, 0) / runtimes.length)
      : null;

    var failingNow = Object.values(wfs).filter(function(w) {
      return w.conclusion === 'failure';
    }).length;

    // --- Populate stat cards ---
    if (totalTests > 0) {
      setText('m-total', totalTests);
      setTrend('m-total', totalFailed > 0
        ? totalFailed + ' currently failing'
        : 'All suites passing');
    }

    if (passRate !== null) {
      // Keep any child <span> (the % suffix)
      var passEl = document.getElementById('m-pass');
      if (passEl) {
        var span = passEl.querySelector('span');
        passEl.textContent = passRate;
        if (span) passEl.appendChild(span);
      }
      setTrend('m-pass', passRate >= 95
        ? 'Excellent — keep it up'
        : passRate >= 80
          ? 'Needs attention'
          : 'Critical — investigate');
    }

    if (maxRun > 0) {
      setText('m-pipelines', maxRun);
      setTrend('m-pipelines', 'Run #' + maxRun);
    }

    if (avgSecs !== null) {
      var rtEl = document.getElementById('m-runtime');
      if (rtEl) {
        var rtSpan = rtEl.querySelector('span');
        var mins = (avgSecs / 60).toFixed(1);
        rtEl.textContent = mins;
        if (rtSpan) rtEl.appendChild(rtSpan);
      }
    }

    // Failing pipelines feeds the "defects" card as proxy for live issues
    if (failingNow > 0) {
      setTrend('m-defects', failingNow + ' pipeline' + (failingNow > 1 ? 's' : '') + ' failing now');
    }
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val !== null && val !== undefined) el.textContent = val;
  }

  function setTrend(metricId, text) {
    var el = document.getElementById(metricId);
    if (!el) return;
    var card = el.closest ? el.closest('.metric-card') : null;
    var trend = card ? card.querySelector('.metric-trend') : null;
    if (trend && text) trend.textContent = text;
  }

  // ── 3. FETCH ──────────────────────────────────────────────────────────────
  function showNote(msg) {
    var el = document.getElementById('ci-dashboard-note');
    if (el) { el.hidden = false; el.textContent = msg; }
  }
  function hideNote() {
    var el = document.getElementById('ci-dashboard-note');
    if (el) el.hidden = true;
  }
  function showError(msg) {
    var el = document.getElementById('ci-dashboard-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
    var grid = document.getElementById('ci-dashboard-grid');
    if (grid) grid.innerHTML = '';
  }

  async function loadData() {
    try {
      var res = await fetch(bust(DASHBOARD_URL));
      if (res.ok) { hideNote(); return await res.json(); }

      if (res.status === 404 && isLocal()) {
        var fb = await fetch(bust(FALLBACK_URL));
        if (fb.ok) {
          showNote('Local snapshot — /ci-status/dashboard.json not served in dev.');
          return await fb.json();
        }
        showError('No CI data yet — push a commit to trigger the first pipeline run.');
        return null;
      }
      showError('Failed to load CI status (HTTP ' + res.status + ').');
      return null;
    } catch (err) {
      if (isLocal()) {
        try {
          var fb2 = await fetch(bust(FALLBACK_URL));
          if (fb2.ok) {
            showNote('Local snapshot — live endpoint unreachable in dev.');
            return await fb2.json();
          }
        } catch (_) {}
      }
      showError('Unable to load CI status. Check your network connection.');
      console.warn('[ci-dashboard]', err);
      return null;
    }
  }

  async function refresh() {
    var data = await loadData();
    if (!data) return;
    if (document.getElementById('ci-dashboard-grid')) renderPipelineCards(data);
    if (document.getElementById('m-total') || document.getElementById('m-pass')) updateQAMetrics(data);
  }

  // ── 4. INIT ───────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var hasPipeline = !!document.getElementById('ci-dashboard-grid');
    var hasMetrics  = !!(document.getElementById('m-total') || document.getElementById('m-pass'));
    if (!hasPipeline && !hasMetrics) return;
    refresh();
    setInterval(refresh, REFRESH_MS);
  });

})();
