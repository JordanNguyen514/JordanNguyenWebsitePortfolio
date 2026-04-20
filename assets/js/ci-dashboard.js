/**
 * ============================================================
 *  assets/js/ci-dashboard.js
 *
 *  Fetches the live CI status JSON written to S3/CloudFront
 *  by each GitHub Actions workflow and renders the dashboard.
 *
 *  Data source: /ci-status/dashboard.json (same CloudFront domain)
 *  Updated:     Automatically after each workflow run completes
 *
 *  CONCEPT — Why serve from S3/CloudFront instead of GitHub API?
 *  ──────────────────────────────────────────────────────────────
 *  GitHub API:       60 req/hour unauthenticated, requires CORS
 *                    proxy or exposing a token in browser code
 *  S3/CloudFront:    No rate limit, same domain (no CORS),
 *                    token never leaves GitHub Actions
 *  This pattern is standard in production observability:
 *  write metrics at the source, read from a controlled endpoint.
 * ============================================================
 */

(function () {
  'use strict';

  const DASHBOARD_URL = '/ci-status/dashboard.json';
  const REFRESH_MS    = 30000; // re-fetch every 30s while page is open

  // ── Workflow display configuration ───────────────────────────────────────
  // Ordered intentionally: deploy first (gate), then tests, then quality/security
  const WORKFLOW_CONFIG = {
    'deploy':      { label: 'Deploy to S3',              icon: '☁️',  category: 'deploy'   },
    'cypress-e2e': { label: 'Cypress E2E',                icon: '🌲',  category: 'test'     },
    'playwright':  { label: 'Playwright (Cross-Browser)', icon: '🎭',  category: 'test'     },
    'robot':       { label: 'Robot Framework',            icon: '🤖',  category: 'test'     },
    'karate':      { label: 'Karate API Tests',           icon: '🥋',  category: 'test'     },
    'lighthouse':  { label: 'Lighthouse CI',              icon: '🔦',  category: 'quality'  },
    'mutation':    { label: 'Mutation Testing',           icon: '🧬',  category: 'quality'  },
    'security':    { label: 'Security (Snyk + OWASP)',    icon: '🔒',  category: 'security' },
    'synthetics':  { label: 'API Synthetics',             icon: '📡',  category: 'quality'  },
  };

  // ── Status display helpers ────────────────────────────────────────────────
  const STATUS = {
    success:   { badge: 'passing', cssClass: 'ci-passing', icon: '✅' },
    failure:   { badge: 'failing', cssClass: 'ci-failing', icon: '❌' },
    cancelled: { badge: 'cancelled', cssClass: 'ci-cancelled', icon: '⚠️' },
    skipped:   { badge: 'skipped', cssClass: 'ci-skipped', icon: '⏭️' },
    unknown:   { badge: 'unknown', cssClass: 'ci-unknown', icon: '⏳' },
  };

  function getStatus(conclusion) {
    return STATUS[conclusion] || STATUS.unknown;
  }

  function timeAgo(isoString) {
    if (!isoString) return 'never';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // ── Render functions ──────────────────────────────────────────────────────
  function renderCard(id, workflowData) {
    const config = WORKFLOW_CONFIG[id] || { label: id, icon: '⚙️', category: 'other' };
    const st = getStatus(workflowData ? workflowData.conclusion : null);
    const updated = workflowData ? timeAgo(workflowData.updatedAt) : '—';
    const runUrl  = workflowData ? workflowData.runUrl : '#';
    const runNum  = workflowData ? `#${workflowData.runNumber}` : '';
    const commit  = workflowData ? workflowData.commitSha : '';

    return `
      <a href="${runUrl}" target="_blank" rel="noopener" class="ci-card ${st.cssClass}" data-workflow="${id}">
        <div class="ci-card-header">
          <span class="ci-card-icon">${config.icon}</span>
          <span class="ci-card-name">${config.label}</span>
        </div>
        <div class="ci-card-status">
          <span class="ci-status-icon">${st.icon}</span>
          <span class="ci-status-badge">${st.badge}</span>
        </div>
        <div class="ci-card-meta">
          <span class="ci-run-number">${runNum}</span>
          ${commit ? `<span class="ci-commit">${commit}</span>` : ''}
          <span class="ci-updated">${updated}</span>
        </div>
      </a>`;
  }

  function renderDashboard(data) {
    const container = document.getElementById('ci-dashboard-grid');
    const lastUpdatedEl = document.getElementById('ci-last-updated');
    const errorEl = document.getElementById('ci-dashboard-error');
    if (!container) return;

    if (errorEl) errorEl.style.display = 'none';

    const workflows = data.workflows || {};

    // Render in defined order, fill with "unknown" for any not yet run
    const cards = Object.keys(WORKFLOW_CONFIG).map(id => {
      return renderCard(id, workflows[id] || null);
    }).join('');

    container.innerHTML = cards;

    if (lastUpdatedEl && data.lastUpdated) {
      lastUpdatedEl.textContent = `Last updated: ${timeAgo(data.lastUpdated)}`;
    }

    // Update the overall pipeline health indicator
    const allWorkflows = Object.values(workflows);
    if (allWorkflows.length > 0) {
      const failCount = allWorkflows.filter(w => w.conclusion === 'failure').length;
      const healthEl = document.getElementById('ci-pipeline-health');
      if (healthEl) {
        if (failCount === 0) {
          healthEl.textContent = '✅ All pipelines passing';
          healthEl.className   = 'ci-health-passing';
        } else {
          healthEl.textContent = `❌ ${failCount} pipeline${failCount > 1 ? 's' : ''} failing`;
          healthEl.className   = 'ci-health-failing';
        }
      }
    }
  }

  function showError(message) {
    const errorEl = document.getElementById('ci-dashboard-error');
    const container = document.getElementById('ci-dashboard-grid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    if (container) container.innerHTML = '';
  }

  // ── Fetch and refresh ─────────────────────────────────────────────────────
  async function fetchAndRender() {
    try {
      // Cache-bust with timestamp so CloudFront no-cache header is honoured
      const res = await fetch(`${DASHBOARD_URL}?t=${Date.now()}`);
      if (!res.ok) {
        // 404 means no workflow has run yet and written the JSON
        if (res.status === 404) {
          showError('No CI data yet — push a commit to trigger the first pipeline run.');
        } else {
          showError(`Failed to load CI status (HTTP ${res.status}).`);
        }
        return;
      }
      const data = await res.json();
      renderDashboard(data);
    } catch (err) {
      // Network error or JSON parse failure
      showError('Unable to load CI status. Check your network connection.');
      console.warn('[ci-dashboard]', err);
    }
  }

  // ── Initialise ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('ci-pipeline-section');
    if (!section) return; // Not on a page with the dashboard

    fetchAndRender();
    // Auto-refresh while page is open
    setInterval(fetchAndRender, REFRESH_MS);
  });

})();
