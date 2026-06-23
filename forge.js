/* ═══════════════════════════════════════════════════
   FORGE — Motion Graphics & Interactions
═══════════════════════════════════════════════════ */

'use strict';

/* ── Scroll Restoration ──────────────────────────── */
// Always start at top on refresh — disable browser scroll memory
if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ── Page Transitions ────────────────────────────── */
(function initPageTransitions() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    // Skip anchors, mailto, tel, external/new-tab links
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || link.target === '_blank') return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = href; }, 320);
  });
})();

/* ── Page Reveal (no-loader) ─────────────────────── */
(function initPageReveal() {
  // Mark JS active so CSS knows animations are safe to run
  document.documentElement.classList.add('js-ready');

  function revealViewport() {
    document.querySelectorAll('.reveal-clip, .reveal-up, .fade-up').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100 && rect.bottom > 0) {
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('visible'), delay);
      }
    });
    initRevealAnimations(); // wire up observer for below-fold
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Double rAF ensures layout is fully computed before measuring positions
      requestAnimationFrame(() => requestAnimationFrame(revealViewport));
    });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(revealViewport));
  }

  // Hard failsafe — force everything visible 1s after full page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.reveal-clip, .reveal-up, .fade-up')
        .forEach(el => el.classList.add('visible'));
    }, 1000);
  });
})();

/* ── Canvas Hero Background ──────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: -999, y: -999 };
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST   = 140;
  const ACCENT         = { r: 255, g: 170, b: 0 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const grid = 80;
    for (let x = 0; x < W; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Particles & connections
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Subtle mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        p.x += dx / dist * 0.8;
        p.y += dy / dist * 0.8;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();

      // Connections
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const d  = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.15;
          const isNearMouse = dist < 150;
          if (isNearMouse) {
            ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha * 1.5})`;
          } else {
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          }
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  canvas.closest('.hero')?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.closest('.hero')?.addEventListener('mouseleave', () => {
    mouse.x = -999; mouse.y = -999;
  });

  resize();
  createParticles();
  draw();
})();

/* ── Custom Cursor ───────────────────────────────── */
(function initCursor() {
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');
  if (!cursor || !cursorTrail || window.matchMedia('(pointer:coarse)').matches) return;

  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    cursorTrail.style.left = tx + 'px';
    cursorTrail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%,-50%) scale(0.7)');
  document.addEventListener('mouseup',   () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
})();

/* ── Navigation ──────────────────────────────────── */
(function initNav() {
  const nav     = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const menu    = document.getElementById('mobileMenu');
  if (!nav) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile menu
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuBtn.classList.toggle('active', open);
      menuBtn.setAttribute('aria-expanded', open);
      document.body.classList.toggle('menu-open', open);
    });

    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ── Scroll Reveal Animations ────────────────────── */
function initRevealAnimations() {
  const revealOpts = { threshold: 0.15, rootMargin: '0px 0px -60px 0px' };

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  }, revealOpts);

  document.querySelectorAll('.reveal-clip, .reveal-up, .fade-up')
    .forEach(el => revealObserver.observe(el));
}

/* ── Count-Up Numbers ────────────────────────────── */
(function initCountUp() {
  const elems = document.querySelectorAll('.stat-n[data-count]');
  if (!elems.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur    = 1800;
      const start  = performance.now();

      function update(now) {
        const t   = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val  = Math.round(ease * target);
        el.textContent = prefix + val + suffix;
        if (t < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  elems.forEach(el => observer.observe(el));
})();

/* ── Magnetic Buttons ────────────────────────────── */
(function initMagnetic() {
  const btns = document.querySelectorAll('[data-magnetic]');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.25;
      const dy     = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ── Testimonials: duplicate for infinite scroll ── */
(function initTestiTrack() {
  const track = document.querySelector('.testi-track');
  if (!track) return;
  const cards = track.querySelectorAll('.testi-card');
  cards.forEach(card => track.appendChild(card.cloneNode(true)));
})();

/* ── Smooth Scroll ───────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Hero Badge Rotation on Scroll ──────────────── */
(function initBadgeScroll() {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;
  window.addEventListener('scroll', () => {
    const rotation = window.scrollY * 0.05;
    badge.style.transform = `rotate(${rotation}deg)`;
  }, { passive: true });
})();

/* ── Parallax: hero title on scroll ─────────────── */
(function initHeroParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroContent.style.transform = `translateY(${y * 0.18}px)`;
    /* opacity kept at 1 — no fade-out so content stays clickable/readable */
  }, { passive: true });
})();

/* ── Service Cards: horizontal glow follow ────────  */
(function initCardGlow() {
  document.querySelectorAll('.svc-card, .work-card, .testi-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

/* ── Contact Form ────────────────────────────────── */
(function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const span = btn.querySelector('span');
    if (!btn) return;

    btn.disabled = true;
    span.textContent = 'Sending…';
    btn.style.opacity = '0.7';

    setTimeout(() => {
      span.textContent = 'Message Sent ✓';
      btn.style.background = '#22c55e';
      btn.style.borderColor = '#22c55e';
      btn.style.opacity = '1';
      form.reset();
      setTimeout(() => {
        span.textContent = 'Send Message';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
      }, 3000);
    }, 1200);
  });

  // Floating label effect
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('focus',  () => field.parentElement.classList.add('focused'));
    field.addEventListener('blur',   () => field.parentElement.classList.remove('focused'));
  });
})();

/* ── Hero glow follows mouse ─────────────────────── */
(function initHeroGlow() {
  const glow = document.querySelector('.hero-glow');
  const hero = document.querySelector('.hero');
  if (!glow || !hero) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    glow.style.left = x + '%';
    glow.style.top  = y + '%';
  });
})();

/* ── Page: add loaded class for post-load transitions */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
