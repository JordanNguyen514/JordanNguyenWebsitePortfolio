(function () {
  'use strict';

  var grid = document.getElementById('linkedin-recommendations');
  if (!grid) return;

  var statusEl = document.getElementById('testi-source-status');
  var sourceUrl = 'https://www.linkedin.com/in/jordan-nguyen-910365a7/details/recommendations/?detailScreenTabIndex=0';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(name) {
    return String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) { return part.charAt(0).toUpperCase(); })
      .join('') || 'JN';
  }

  function formatDate(value) {
    if (!value) return '';
    var date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function renderRecommendation(item, index) {
    var featured = index === 0 ? ' featured' : '';
    var meta = [formatDate(item.date), item.relationship].filter(Boolean).join(' - ');

    return [
      '<article class="testi-card' + featured + '">',
      '  <div class="tc-quote-mark">"</div>',
      '  <blockquote class="tc-quote">' + escapeHtml(item.quote) + '</blockquote>',
      '  <div class="tc-author">',
      '    <div class="tc-avatar" aria-hidden="true">' + escapeHtml(initials(item.author)) + '</div>',
      '    <div class="tc-author-info">',
      '      <span class="tc-name">' + escapeHtml(item.author) + '</span>',
      '      <span class="tc-role">' + escapeHtml(item.headline) + '</span>',
      meta ? '      <span class="tc-meta">' + escapeHtml(meta) + '</span>' : '',
      '    </div>',
      '    <a href="' + escapeHtml(sourceUrl) + '" class="tc-li-btn" target="_blank" rel="noopener" aria-label="View recommendation on LinkedIn">in</a>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderError(message) {
    grid.innerHTML = [
      '<article class="testi-card testi-error">',
      '  <div class="tc-quote-mark">"</div>',
      '  <blockquote class="tc-quote">' + escapeHtml(message) + '</blockquote>',
      '  <a href="' + escapeHtml(sourceUrl) + '" class="testi-cta-btn" target="_blank" rel="noopener">View recommendations on LinkedIn</a>',
      '</article>'
    ].join('');
  }

  function updateStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  async function loadRecommendations() {
    var dataUrl = grid.getAttribute('data-source');
    if (!dataUrl) {
      renderError('Recommendation source is not configured.');
      updateStatus('LinkedIn recommendation source unavailable.');
      return;
    }

    try {
      var response = await fetch(dataUrl);
      if (!response.ok) throw new Error('HTTP ' + response.status);

      var data = await response.json();
      sourceUrl = data.sourceUrl || sourceUrl;
      var recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];

      if (recommendations.length === 0) {
        renderError('No LinkedIn recommendations are available yet.');
        updateStatus('No LinkedIn recommendations found.');
        return;
      }

      grid.innerHTML = recommendations.map(renderRecommendation).join('');
      updateStatus('Recommendations sourced from LinkedIn.');
    } catch (error) {
      console.warn('[testimonials]', error);
      renderError('Unable to load the LinkedIn recommendations snapshot.');
      updateStatus('LinkedIn recommendations could not be loaded.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecommendations);
  } else {
    loadRecommendations();
  }
})();
