/* ==========================================================
   Mark John Flores | Portfolio
   Vanilla JavaScript, no dependencies.
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CONTACT_EMAIL = 'ryuuflores2006@gmail.com';

  /* ---------- Helpers ---------- */
  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function safeStorage(action, key, value) {
    try {
      if (action === 'get') return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (err) { /* storage can be blocked (private mode, file://) */ }
    return null;
  }

  /* ---------- Theme toggle ---------- */
  var themeToggle = $('#theme-toggle');
  var themeColorMeta = $('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0d1220' : '#f4f6fb');
  }

  applyTheme(safeStorage('get', 'mjf-theme') === 'light' ? 'light' : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      safeStorage('set', 'mjf-theme', next);
    });
  }

  /* ---------- Mobile navigation ---------- */
  var header = $('#site-header');
  var navToggle = $('#nav-toggle');
  var navLinks = $('#nav-links');

  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (navToggle.getAttribute('aria-expanded') === 'true' &&
          !navLinks.contains(event.target) && !navToggle.contains(event.target)) {
        setMenu(false);
      }
    });

    window.matchMedia('(min-width: 900px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Smooth scrolling for in-page links ---------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      var target = $(hash);
      if (!target) return;

      event.preventDefault();
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
      window.scrollTo({ top: hash === '#home' ? 0 : top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

      try { window.history.replaceState(null, '', hash); } catch (err) { /* ignore on file:// */ }

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      setMenu(false);
    });
  });

  /* ---------- Header state + back-to-top visibility ---------- */
  var toTop = $('#to-top');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  $$('[data-back-to-top]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      var home = $('#home');
      if (home) { home.setAttribute('tabindex', '-1'); home.focus({ preventScroll: true }); }
    });
  });

  /* ---------- Active navigation indicator ---------- */
  var navAnchors = $$('.nav-link');
  var sections = navAnchors
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navAnchors.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
  setActive('home');

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  var revealItems = $$('[data-reveal]');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ---------- Typing animation ---------- */
  var typedEl = $('#typed');
  var roles = ['IT Specialist', 'Web & Software Developer', 'Hardware Support Specialist', 'Database Builder'];

  if (typedEl && !prefersReducedMotion) {
    var roleIndex = 0;
    var charIndex = roles[0].length;
    var deleting = true; // start by erasing the pre-filled first role

    var tick = function () {
      var current = roles[roleIndex];
      var delay = deleting ? 45 : 85;

      if (deleting) {
        charIndex--;
      } else {
        charIndex++;
      }
      typedEl.textContent = current.slice(0, charIndex);

      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      }
      window.setTimeout(tick, delay);
    };
    window.setTimeout(tick, 2400); // let the first role show before it starts cycling
  }

  /* ---------- Animated counters ---------- */
  var counters = $$('[data-counter]');

  function formatCounter(el, value) {
    el.textContent = (el.dataset.prefix || '') + value + (el.dataset.suffix || '');
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    if (prefersReducedMotion) { formatCounter(el, target); return; }

    var duration = 1600;
    var start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      formatCounter(el, Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { formatCounter(el, 0); counterObserver.observe(el); });
  }

  /* ---------- Project filtering ---------- */
  var filterButtons = $$('.filter-btn');
  var projectGrid = $('#projects-grid');
  var projectCards = $$('.project-card');
  var filterTimer = null;

  function applyFilter(filter) {
    projectGrid.classList.add('is-filtering');
    window.clearTimeout(filterTimer);

    projectCards.forEach(function (card) {
      var categories = (card.dataset.category || '').split(' ');
      var match = filter === 'all' || categories.indexOf(filter) !== -1;
      card.classList.add('is-visible'); // keep revealed state if the card was never scrolled to

      if (match) {
        if (card.hidden) {
          card.hidden = false;
          card.classList.add('is-hiding');
          void card.offsetWidth; // force reflow so the fade-in runs
        }
        card.classList.remove('is-hiding');
      } else {
        card.classList.add('is-hiding');
      }
    });

    filterTimer = window.setTimeout(function () {
      projectCards.forEach(function (card) {
        if (card.classList.contains('is-hiding')) card.hidden = true;
      });
    }, prefersReducedMotion ? 0 : 300);
  }

  if (projectGrid) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (b) {
          var active = b === button;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        applyFilter(button.dataset.filter);
      });
    });
  }

  /* ---------- Toast notifications ---------- */
  var toastRegion = $('#toast-region');

  function showToast(title, message) {
    if (!toastRegion) return;
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>' +
      '<p><strong></strong><span></span></p>';
    $('strong', toast).textContent = title;
    $('span', toast).textContent = message;
    toastRegion.appendChild(toast);

    window.setTimeout(function () {
      toast.classList.add('is-leaving');
      window.setTimeout(function () { toast.remove(); }, 320);
    }, 6000);
  }

  /* ---------- Contact form validation ---------- */
  var form = $('#contact-form');

  var validators = {
    name: function (value) {
      if (!value) return 'Enter your name.';
      if (value.length < 2) return 'Your name needs at least 2 characters.';
      return '';
    },
    email: function (value) {
      if (!value) return 'Enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email, like name@example.com.';
      return '';
    },
    subject: function (value) {
      if (!value) return 'Enter a subject.';
      if (value.length < 3) return 'The subject needs at least 3 characters.';
      return '';
    },
    message: function (value) {
      if (!value) return 'Write a message.';
      if (value.length < 10) return 'Your message needs at least 10 characters.';
      if (value.length > 1500) return 'Keep your message under 1500 characters.';
      return '';
    }
  };

  function validateField(input) {
    var check = validators[input.name];
    if (!check) return true;

    var message = check(input.value.trim());
    var wrapper = input.closest('.field');
    var errorEl = $('#' + input.id + '-error');

    errorEl.textContent = message;
    wrapper.classList.toggle('has-error', Boolean(message));
    wrapper.classList.toggle('is-valid', !message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  if (form) {
    var fields = $$('input, textarea', form);

    fields.forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        // Re-check live only after the field has been flagged once
        if (input.closest('.field').classList.contains('has-error')) validateField(input);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value.trim(),
        message: form.elements.message.value.trim()
      };

      showToast('Message ready, ' + data.name.split(' ')[0] + '.', 'Your email app is opening with the message filled in. Press send there to deliver it.');

      var body = data.message + '\n\n' + 'From: ' + data.name + ' (' + data.email + ')';
      var mailto = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(data.subject) +
        '&body=' + encodeURIComponent(body);

      form.reset();
      fields.forEach(function (input) {
        input.closest('.field').classList.remove('has-error', 'is-valid');
        input.removeAttribute('aria-invalid');
        $('#' + input.id + '-error').textContent = '';
      });

      window.setTimeout(function () { window.location.href = mailto; }, 600);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
