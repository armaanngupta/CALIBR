/* ============================================================
   CALIBR — INTERACTIVE JAVASCRIPT
   ============================================================ */

'use strict';

/* ---- NAVBAR SCROLL STATE ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- TYPEWRITER EFFECT ---- */
const phrases = [
  'The future of precision drafting.',
  'One device. Five tools. Zero compromise.',
  'Engineered for every student.',
  'Measurement, redefined.'
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const twEl = document.getElementById('typewriter');

function typewrite() {
  const current = phrases[phraseIdx];
  if (!deleting) {
    twEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typewrite, 2400);
      return;
    }
  } else {
    twEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typewrite, 300);
      return;
    }
  }
  setTimeout(typewrite, deleting ? 40 : 68);
}
setTimeout(typewrite, 900);

/* ---- AUTO-SCROLL (continuous, loop to top at bottom) ---- */
const AUTOSCROLL_STEP = 2;          // px per tick
const AUTOSCROLL_INTERVAL = 16;     // ms per tick (~60fps)
const AUTOSCROLL_RESUME_MS = 3000;  // pause duration after user input

let autoScrollPaused = false;
let autoScrollResumeTimer = null;
let autoScrollSuppressEvents = false;

function setScrollTopInstant(y) {
  // Bypass CSS scroll-behavior:smooth by writing the scroll position directly.
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  autoScrollSuppressEvents = true;
  html.scrollTop = y;
  document.body.scrollTop = y;
  html.style.scrollBehavior = prev;
  // Allow the synthetic scroll event to flush before re-enabling user-input detection.
  requestAnimationFrame(() => { autoScrollSuppressEvents = false; });
}

function autoScrollTick() {
  if (autoScrollPaused) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;
  if (scrollTop >= maxScroll - 1) {
    setScrollTopInstant(0);
  } else {
    autoScrollSuppressEvents = true;
    window.scrollBy(0, AUTOSCROLL_STEP);
    requestAnimationFrame(() => { autoScrollSuppressEvents = false; });
  }
}

function pauseAutoScroll() {
  if (autoScrollSuppressEvents) return;
  autoScrollPaused = true;
  clearTimeout(autoScrollResumeTimer);
  autoScrollResumeTimer = setTimeout(() => {
    autoScrollPaused = false;
  }, AUTOSCROLL_RESUME_MS);
}

window.addEventListener('wheel', pauseAutoScroll, { passive: true });
window.addEventListener('touchstart', pauseAutoScroll, { passive: true });
window.addEventListener('mousemove', pauseAutoScroll, { passive: true });
window.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
    pauseAutoScroll();
  }
});

function clearAutoScroll() {
  pauseAutoScroll();
}

setTimeout(() => {
  setInterval(autoScrollTick, AUTOSCROLL_INTERVAL);
}, 1500);

/* ---- SCROLL REVEAL — IntersectionObserver ---- */
function setupReveal(selector, threshold = 0.15) {
  const els = document.querySelectorAll(selector);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold });
  els.forEach(el => obs.observe(el));
}

setupReveal('.reveal-fade', 0.12);
setupReveal('.reveal-slide-up', 0.12);
setupReveal('.reveal-tnode', 0.25);

/* ---- TIMELINE LINE DRAW ---- */
const timelineLine = document.getElementById('timelineLine');
const timelineContainer = document.querySelector('.timeline-container');
const timelineNodes = document.querySelectorAll('.tnode');

function updateTimeline() {
  if (!timelineContainer) return;
  const rect = timelineContainer.getBoundingClientRect();
  const viewH = window.innerHeight;
  const progress = Math.max(0, Math.min(1,
    (viewH - rect.top) / (rect.height + viewH * 0.4)
  ));
  if (timelineLine) timelineLine.style.width = (progress) + '%';

  // Activate nodes as line passes them
  timelineNodes.forEach(node => {
    const nr = node.getBoundingClientRect();
    if (nr.top < viewH * 0.72) {
      node.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', updateTimeline, { passive: true });
updateTimeline();



/* ---- EMAIL NOTIFY ---- */
const notifyBtn = document.getElementById('notifyBtn');
const notifyEmail = document.getElementById('notifyEmail');
const notifyMsg = document.getElementById('notifyMsg');

notifyBtn.addEventListener('click', () => {
  const val = notifyEmail.value.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val || !emailRx.test(val)) {
    notifyMsg.style.color = '#ff4444';
    notifyMsg.textContent = '⚠ Please enter a valid email address.';
    return;
  }
  notifyMsg.style.color = 'var(--blue)';
  notifyMsg.textContent = `✓ Got it! We'll notify ${val} when Calibr launches.`;
  notifyEmail.value = '';
});

notifyEmail.addEventListener('keydown', e => {
  if (e.key === 'Enter') notifyBtn.click();
});

/* ---- HAMBURGER MENU ---- */
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  const linksEl = document.querySelector('.nav-links');
  const open = linksEl.style.display === 'flex';
  if (open) {
    linksEl.style.display = 'none';
  } else {
    linksEl.style.cssText = `
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 64px; left: 0; right: 0;
      background: rgba(10,10,10,0.98);
      padding: 24px 32px;
      gap: 20px;
      border-bottom: 1px solid var(--border);
    `;
  }
});

/* ---- SMOOTH SECTION NAV ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      userScrolled = true;
      clearAutoScroll();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      const linksEl = document.querySelector('.nav-links');
      if (linksEl) linksEl.style.display = '';
    }
  });
});

/* ---- FEATURE CARD TILT (desktop) ---- */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    // only apply tilt on front (no flip)
    const inner = card.querySelector('.card-inner');
    if (!card.matches(':hover')) return;
  });
});

/* ---- PARALLAX HERO GRID ---- */
const heroGrid = document.querySelector('.hero-grid-overlay');
window.addEventListener('scroll', () => {
  if (heroGrid) {
    heroGrid.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }
}, { passive: true });

/* ---- METRIC COUNTER ANIMATION ---- */
function animateCounter(el, target, suffix, duration = 1200) {
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = Math.round(ease * target);
    el.childNodes[0].textContent = val;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const metricsObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const metricVals = document.querySelectorAll('.metric-val');
      const targets = [15, 12, 5, 75];
      metricVals.forEach((mv, i) => {
        animateCounter(mv, targets[i], '', 1400);
      });
      metricsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const metricBar = document.querySelector('.hero-metric-bar');
if (metricBar) metricsObserver.observe(metricBar);
