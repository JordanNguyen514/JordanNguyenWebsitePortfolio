// --- Global Time Function ---

function checkTime(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function startTime() {
  const today = new Date();
  const h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  if (document.getElementById('time')) {
    document.getElementById('time').innerHTML = 'Time: ' + h + ':' + m + ':' + s;
  }
  setTimeout(startTime, 500); // no need to store — never cancelled
}

startTime();

// Exposed on window so inline HTML onclick="myFunction()" can call it
window.myFunction = function () {
  const x = document.getElementById('mytopnav');
  if (x.className === 'topnav') {
    x.className += ' responsive';
  } else {
    x.className = 'topnav';
  }
};

/**
 * Toggles read-more/less text. Called via onclick in HTML templates.
 * @param {string} dotsId
 * @param {string} moreId
 * @param {string} btnId
 * @param {string} lang - 'en' or 'fr'
 */
window.toggleReadMore = function (dotsId, moreId, btnId, lang) {
  const dots = document.getElementById(dotsId);
  const moreText = document.getElementById(moreId);
  const btnText = document.getElementById(btnId);

  if (dots.style.display === 'none') {
    dots.style.display = 'inline';
    btnText.innerHTML = lang === 'fr' ? 'Lire Plus' : 'Read More';
    moreText.style.display = 'none';
  } else {
    dots.style.display = 'none';
    btnText.innerHTML = lang === 'fr' ? 'Lire Moins' : 'Read Less';
    moreText.style.display = 'inline';
  }
};


// Scroll effects + Back to Top button (single consolidated DOMContentLoaded listener)
document.addEventListener('DOMContentLoaded', () => {
  const topnav = document.querySelector('.topnav');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const scrollThreshold = 50;
  const visibilityThreshold = 300;

  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      topnav.classList.add('scrolled');
    } else {
      topnav.classList.remove('scrolled');
    }

    if (backToTopBtn) {
      backToTopBtn.style.display = window.scrollY > visibilityThreshold ? 'block' : 'none';
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// ── Mobile hamburger menu ─────────────────────────────────────────────────
// Toggles .nav-open on .topnav (shows/hides nav-links panel)
// Toggles .mobile-open on each .nav-dropdown (expands sub-menus)
(function () {
  let hamburger = document.getElementById('navHamburger');
  let topnav    = document.querySelector('.topnav');
  if (!hamburger || !topnav) return;

  // Toggle the full nav panel
  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    topnav.classList.toggle('nav-open');
  });

  // Toggle individual dropdown sub-menus inside mobile panel
  let dropdownBtns = document.querySelectorAll('.nav-links .nav-dropdown-btn');
  dropdownBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      let parent = btn.closest('.nav-dropdown');
      if (parent) parent.classList.toggle('mobile-open');
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', function (e) {
    if (!topnav.contains(e.target)) {
      topnav.classList.remove('nav-open');
    }
  });

  // Close nav after navigating to a link
  let navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      topnav.classList.remove('nav-open');
    });
  });
})();
