// ===== Sarufi Energy Group — shared site behavior =====

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Sticky nav solid state ---- */
  const nav = document.querySelector('.site-nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('solid');
    else nav.classList.remove('solid');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
      burger.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Count-up stats ---- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countIO.observe(el));
  }

  /* ---- Contact form -> mailto ---- */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const subject = form.querySelector('#subject').value.trim() || 'Website enquiry';
      const message = form.querySelector('#message').value.trim();
      const body = `Name: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;
      window.location.href = `mailto:info@sarufigroup.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    });
  }

  /* ---- Current year ---- */
  document.querySelectorAll('.cur-year').forEach(el => el.textContent = new Date().getFullYear());

  /* ---- Hero image carousel (auto-rotate, robust hover-pause, random transitions, manual dots) ---- */
  const heroEl = document.querySelector('#heroCarousel');
  if (heroEl) {
    const slides = heroEl.querySelectorAll('.hero-slide');
    const dots = heroEl.querySelectorAll('.hero-dot');
    const EFFECTS = ['effect-slide-l', 'effect-slide-r', 'effect-kenburns', 'effect-wipe'];
    const INTERVAL = 4200; // ms between auto-advances
    let current = 0;
    let hovering = false;
    let lastTick = performance.now();

    const clearEffects = (el) => EFFECTS.forEach(cls => el.classList.remove(cls));

    const goTo = (idx) => {
      const prev = current;
      current = (idx + slides.length) % slides.length;
      if (prev === current) return;
      const effect = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
      clearEffects(slides[current]);
      slides[current].classList.add(effect);
      // force reflow so the animation restarts even if the class was already present
      void slides[current].offsetWidth;
      slides[current].classList.add('active');
      slides[prev].classList.remove('active');
      dots[prev].classList.remove('active');
      dots[current].classList.add('active');
    };

    // Reliable pointer-based hover tracking (works better than mouseenter/leave across scroll/touch)
    heroEl.addEventListener('pointerenter', () => { hovering = true; });
    heroEl.addEventListener('pointerleave', () => { hovering = false; lastTick = performance.now(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.getAttribute('data-idx'), 10));
        lastTick = performance.now();
      });
    });

    if (slides.length > 1) {
      // Single persistent heartbeat avoids the classic setInterval/clearInterval "stuck" bug
      setInterval(() => {
        if (hovering) { return; }
        if (performance.now() - lastTick >= INTERVAL) {
          goTo(current + 1);
          lastTick = performance.now();
        }
      }, 200);
    }
  }
});
