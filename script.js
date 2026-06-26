/* ================================================================
   ALEX NOVA — PORTFOLIO SCRIPT
   Modules: Loader · Cursor · Canvas · Navbar · Typing · Scroll ·
            Counters · Skills · Projects · Theme · Contact · Misc
================================================================ */

'use strict';

/* ================================================================
   1. PAGE LOADER
================================================================ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Simulate minimum load time for smooth UX
  const minDelay = 2200;
  const start = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDelay - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      // Trigger first wave of scroll reveals after load
      checkReveal();
    }, remaining);
  });
})();


/* ================================================================
   2. CUSTOM CURSOR
================================================================ */
(function initCursor() {
  const outer = document.getElementById('cursorOuter');
  const inner = document.getElementById('cursorInner');
  if (!outer || !inner) return;

  // Only on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mouseX = 0, mouseY = 0;
  let outerX = 0, outerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    inner.style.left = mouseX + 'px';
    inner.style.top  = mouseY + 'px';

    // Update mouse glow
    const glow = document.querySelector('.mouse-glow');
    if (glow) { glow.style.left = mouseX + 'px'; glow.style.top = mouseY + 'px'; }
  });

  // Smooth outer cursor via RAF
  function animateCursor() {
    outerX += (mouseX - outerX) * 0.12;
    outerY += (mouseY - outerY) * 0.12;
    outer.style.left = outerX + 'px';
    outer.style.top  = outerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Link hover state
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('[data-cursor="link"]') || e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      document.body.classList.add('cursor-link');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-cursor="link"]') || e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      document.body.classList.remove('cursor-link');
    }
  });
})();


/* ================================================================
   3. MOUSE GLOW
================================================================ */
(function initMouseGlow() {
  const glow = document.createElement('div');
  glow.className = 'mouse-glow';
  document.body.appendChild(glow);
})();


/* ================================================================
   4. CONSTELLATION CANVAS
================================================================ */
(function initConstellation() {
  const canvas = document.getElementById('constellationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: null, y: null };
  const PARTICLE_COUNT = 80;
  const MAX_DIST = 140;
  const MOUSE_RADIUS = 200;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticles();
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.8 + 0.6;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.6;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      // Speed damping
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap edges
      if (this.x < -20) this.x = W + 10;
      if (this.x > W+20) this.x = -10;
      if (this.y < -20) this.y = H + 10;
      if (this.y > H+20) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.3;
          const grad = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          grad.addColorStop(0, `rgba(124,58,237,${opacity})`);
          grad.addColorStop(1, `rgba(0,212,255,${opacity})`);

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  window.addEventListener('resize', resize);
  resize();
  animate();
})();


/* ================================================================
   5. NAVBAR
================================================================ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!navbar) return;

  // Mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger && hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    toggleMenu(!isOpen);
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Scroll behaviour
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    navbar.classList.toggle('scrolled', sy > 60);
    lastScroll = sy;
    updateActiveLink(sy);
  }, { passive: true });

  // Active link highlight
  function updateActiveLink(scrollY) {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 120) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }
})();


/* ================================================================
   6. SCROLL PROGRESS BAR
================================================================ */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
})();


/* ================================================================
   7. TYPING ANIMATION
================================================================ */
(function initTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'responsive web apps.',
    'pixel-perfect UIs.',
    'AI-powered tools.',
    'full-stack solutions.',
    'elegant experiences.',
    'things that matter.'
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;
  const typeSpeed   = 65;
  const deleteSpeed = 35;
  const pauseEnd    = 1800;
  const pauseStart  = 400;

  function tick() {
    const current = phrases[phraseIdx];

    if (deleting) {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, pauseStart);
        return;
      }
      setTimeout(tick, deleteSpeed);
    } else {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, pauseEnd);
        return;
      }
      setTimeout(tick, typeSpeed);
    }
  }

  setTimeout(tick, 1200);
})();


/* ================================================================
   8. SCROLL REVEAL
================================================================ */
function checkReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const trigger = window.innerHeight * 0.88;

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < trigger) el.classList.add('visible');
  });
}

window.addEventListener('scroll', checkReveal, { passive: true });
window.addEventListener('resize', checkReveal);
checkReveal();


/* ================================================================
   9. ANIMATED COUNTERS
================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let started = false;

  function runCounters() {
    if (started) return;
    const section = document.getElementById('about');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.9) return;

    started = true;
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step = 16;
      const increment = target / (duration / step);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current);
        }
      }, step);
    });
  }

  window.addEventListener('scroll', runCounters, { passive: true });
})();


/* ================================================================
   10. SKILL BAR ANIMATIONS
================================================================ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  let animated = false;

  function animateBars() {
    if (animated) return;
    const section = document.getElementById('skills');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.9) return;

    animated = true;
    fills.forEach(fill => {
      const width = fill.dataset.width + '%';
      setTimeout(() => { fill.style.width = width; }, 200);
    });
  }

  window.addEventListener('scroll', animateBars, { passive: true });
})();


/* ================================================================
   11. SKILL CATEGORY FILTER
================================================================ */
(function initSkillFilter() {
  const cats  = document.querySelectorAll('.skill-cat');
  const cards = document.querySelectorAll('.skill-card');

  cats.forEach(cat => {
    cat.addEventListener('click', () => {
      cats.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');

      const filter = cat.dataset.cat;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        if (match) {
          card.classList.remove('hidden');
          card.style.display = '';
        } else {
          card.classList.add('hidden');
          setTimeout(() => {
            if (card.classList.contains('hidden')) card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
})();


/* ================================================================
   12. PROJECT FILTER
================================================================ */
(function initProjectFilter() {
  const filters  = document.querySelectorAll('.proj-filter');
  const cards    = document.querySelectorAll('.project-card');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const tags = (card.dataset.filter || '').split(' ');
        const show = filter === 'all' || tags.includes(filter);
        card.style.transition = 'opacity 0.35s, transform 0.35s';

        if (show) {
          card.style.opacity = '0';
          card.style.display = '';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => { card.style.display = 'none'; }, 350);
        }
      });
    });
  });
})();


/* ================================================================
   13. THEME TOGGLE
================================================================ */
(function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  // Persist preference
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light-theme');

  btn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  });
})();


/* ================================================================
   14. CONTACT FORM
================================================================ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const inputs = form.querySelectorAll('[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = '#ef4444';
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
      }
    });
    if (!valid) return;

    // Simulate submission
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Message';
      form.reset();
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }, 1500);
  });
})();


/* ================================================================
   15. SMOOTH SCROLLING (enhance anchor clicks)
================================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  });
})();


/* ================================================================
   16. CARD TILT EFFECT (3D on hover)
================================================================ */
(function initTilt() {
  // Only on non-touch devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.project-card, .skill-card, .cert-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width / 2;
      const cy    = rect.top + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const rotX  = -dy * 6;
      const rotY  =  dx * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ================================================================
   17. RIPPLE CLICK EFFECT
================================================================ */
(function initRipple() {
  document.querySelectorAll('.ripple').forEach(el => {
    el.addEventListener('click', (e) => {
      const rect   = el.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${x}px; top:${y}px;
        background:rgba(255,255,255,0.2);
        transform:scale(0); animation:rippleAnim 0.6s ease-out forwards;
      `;

      // Inject keyframes once
      if (!document.getElementById('rippleStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleStyle';
        style.textContent = `@keyframes rippleAnim{to{transform:scale(1);opacity:0}}`;
        document.head.appendChild(style);
      }

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();


/* ================================================================
   18. PARALLAX ON HERO BLOBS
================================================================ */
(function initParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    blobs[0] && (blobs[0].style.transform = `translate(0, ${sy * 0.12}px) scale(1)`);
    blobs[1] && (blobs[1].style.transform = `translate(0, ${-sy * 0.08}px) scale(1)`);
    blobs[2] && (blobs[2].style.transform = `translate(0, ${sy * 0.06}px) scale(1)`);
  }, { passive: true });
})();


/* ================================================================
   19. FLOATING BADGES MAGNETIC EFFECT
================================================================ */
(function initMagnetic() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.floating-badge').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) * 0.3;
      const dy = (e.clientY - (rect.top  + rect.height/2)) * 0.3;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();


/* ================================================================
   20. SECTION HIGHLIGHT (subtle bg shift on scroll)
================================================================ */
(function initSectionHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const observerOpts = { threshold: 0.2 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Subtle accent glow on section title
        const title = entry.target.querySelector('.section-title');
        if (title) {
          title.style.transition = 'text-shadow 0.5s';
          title.style.textShadow = '0 0 60px rgba(124,58,237,0.15)';
          setTimeout(() => { title.style.textShadow = ''; }, 1000);
        }
      }
    });
  }, observerOpts);

  sections.forEach(s => observer.observe(s));
})();


/* ================================================================
   21. HERO AVATAR MOUSE PARALLAX
================================================================ */
(function initAvatarParallax() {
  const hero   = document.querySelector('.hero');
  const avatar = document.querySelector('.hero-avatar');
  if (!hero || !avatar) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx   = rect.width / 2;
    const cy   = rect.height / 2;
    const dx   = (e.clientX - rect.left - cx) / cx;
    const dy   = (e.clientY - rect.top  - cy) / cy;
    avatar.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    avatar.style.transform = '';
  });
})();


/* ================================================================
   22. BACK TO TOP VISIBILITY
================================================================ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 500 ? '1' : '0';
  }, { passive: true });
})();


/* ================================================================
   23. CONSOLE EASTER EGG
================================================================ */
(function consoleEasterEgg() {
  const style = [
    'background: linear-gradient(135deg, #7c3aed, #00d4ff)',
    'color: white',
    'padding: 8px 20px',
    'border-radius: 6px',
    'font-size: 14px',
    'font-weight: bold'
  ].join(';');

  console.log('%c👋 Hey curious dev!', style);
  console.log('%cLike what you see? Connect with Sri Jainthu → kannappanlatha00@gmail.com', 'color: #00d4ff; font-size: 12px;');
  console.log('%cBuilt with vanilla HTML/CSS/JS — zero frameworks, zero dependencies 😎', 'color: #8892b0; font-size: 11px;');
})();
