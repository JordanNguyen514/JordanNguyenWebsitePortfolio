/**
 * ============================================================
 *  assets/js/ci-dashboard.js
 *
 *  Fetches the live CI status JSON written to S3/CloudFront
 *  by each GitHub Actions workflow and renders the dashboard.
 *
 *  Production data source: /ci-status/dashboard.json
 *  Local fallback:         /assets/data/ci-dashboard-local.json
 *  Updated:                Automatically after each workflow run completes
 * ============================================================
 */

(function () {
  'use strict';

  const DEFAULT_DASHBOARD_URL = '/ci-status/dashboard.json';
  const DEFAULT_FALLBACK_URL = '/assets/data/ci-dashboard-local.json';
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
  const REFRESH_MS = 30000; // re-fetch every 30s while page is open

  // Ordered intentionally: deploy first (gate), then tests, then quality/security.
  const WORKFLOW_CONFIG = {
    deploy: { label: 'Deploy to S3', icon: '☁️', category: 'deploy' },
    'cypress-e2e': { label: 'Cypress E2E', icon: '🌲', category: 'test' },
    playwright: { label: 'Playwright (Cross-Browser)', icon: '🎭', category: 'test' },
    robot: { label: 'Robot Framework', icon: '🤖', category: 'test' },
    karate: { label: 'Karate API Tests', icon: '🥋', category: 'test' },
    lighthouse: { label: 'Lighthouse CI', icon: '🔦', category: 'quality' },
    mutation: { label: 'Mutation Testing', icon: '🧬', category: 'quality' },
    security: { label: 'Security (Snyk + OWASP)', icon: '🔒', category: 'security' },
    synthetics: { label: 'API Synthetics', icon: '📡', category: 'quality' },
  };

  const STATUS = {
    success: { badge: 'passing', cssClass: 'ci-passing', icon: '✅' },
    failure: { badge: 'failing', cssClass: 'ci-failing', icon: '❌' },
    cancelled: { badge: 'cancelled', cssClass: 'ci-cancelled', icon: '⚠️' },
    skipped: { badge: 'skipped', cssClass: 'ci-skipped', icon: '⏭️' },
    unknown: { badge: 'unknown', cssClass: 'ci-unknown', icon: '⏳' },
  };

  function getStatus(conclusion) {
    return STATUS[conclusion] || STATUS.unknown;
  }

  function isLocalPreviewHost() {
    return LOCAL_HOSTS.has(window.location.hostname);
  }

  function withCacheBust(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  function timeAgo(isoString) {
    if (!isoString) return 'never';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function renderCard(id, workflowData) {
    const config = WORKFLOW_CONFIG[id] || { label: id, icon: '⚙️', category: 'other' };
    const st = getStatus(workflowData ? workflowData.conclusion : null);
    const updated = workflowData ? timeAgo(workflowData.updatedAt) : '—';
    const runUrl = workflowData ? workflowData.runUrl : '#';
    const runNum = workflowData ? `#${workflowData.runNumber}` : '';
    const commit = workflowData ? workflowData.commitSha : '';

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
    const cards = Object.keys(WORKFLOW_CONFIG).map(id => renderCard(id, workflows[id] || null)).join('');
    container.innerHTML = cards;

    if (lastUpdatedEl && data.lastUpdated) {
      lastUpdatedEl.textContent = `Last updated: ${timeAgo(data.lastUpdated)}`;
    }

    const allWorkflows = Object.values(workflows);
    if (allWorkflows.length > 0) {
      const failCount = allWorkflows.filter(workflow => workflow.conclusion === 'failure').length;
      const healthEl = document.getElementById('ci-pipeline-health');
      if (healthEl) {
        if (failCount === 0) {
          healthEl.textContent = '✅ All pipelines passing';
          healthEl.className = 'ci-health-passing';
        } else {
          healthEl.textContent = `❌ ${failCount} pipeline${failCount > 1 ? 's' : ''} failing`;
          healthEl.className = 'ci-health-failing';
        }
      }
    }
  }

  function hideNote() {
    const noteEl = document.getElementById('ci-dashboard-note');
    if (!noteEl) return;
    noteEl.hidden = true;
    noteEl.textContent = '';
    noteEl.className = 'ci-dashboard-note';
  }

  function showNote(message, tone) {
    const noteEl = document.getElementById('ci-dashboard-note');
    if (!noteEl) return;
    noteEl.hidden = false;
    noteEl.textContent = message;
    noteEl.className = `ci-dashboard-note ci-dashboard-note-${tone || 'info'}`;
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

  async function fetchDashboard(url) {
    return fetch(withCacheBust(url));
  }

  async function loadDashboardData(section) {
    const primaryUrl = section.dataset.dashboardUrl || DEFAULT_DASHBOARD_URL;
    const fallbackUrl = section.dataset.dashboardFallbackUrl || DEFAULT_FALLBACK_URL;

    try {
      const primaryRes = await fetchDashboard(primaryUrl);
      if (primaryRes.ok) {
        return { data: await primaryRes.json(), source: 'live' };
      }

      if (!isLocalPreviewHost() || !fallbackUrl) {
        return {
          error: primaryRes.status === 404
            ? 'No CI data yet — push a commit to trigger the first pipeline run.'
            : `Failed to load CI status (HTTP ${primaryRes.status}).`,
        };
      }
    } catch (err) {
      if (!isLocalPreviewHost() || !fallbackUrl) {
        throw err;
      }
    }

    const fallbackRes = await fetchDashboard(fallbackUrl);
    if (!fallbackRes.ok) {
      return { error: `Unable to load the local CI snapshot (HTTP ${fallbackRes.status}).` };
    }

    return {
      data: await fallbackRes.json(),
      source: 'local-snapshot',
    };
  }

  async function fetchAndRender(section) {
    try {
      const result = await loadDashboardData(section);
      if (result.error) {
        hideNote();
        showError(result.error);
        return;
      }

      renderDashboard(result.data);
      if (result.source === 'local-snapshot') {
        showNote(
          'Showing the checked-in local snapshot because the live /ci-status/dashboard.json file is not served by the local preview.',
          'info'
        );
      } else {
        hideNote();
      }
    } catch (err) {
      hideNote();
      showError('Unable to load CI status. Check your network connection.');
      console.warn('[ci-dashboard]', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('ci-pipeline-section');
    if (!section) return;

    fetchAndRender(section);
    setInterval(() => fetchAndRender(section), REFRESH_MS);
  });
})();
