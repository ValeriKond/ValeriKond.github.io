// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
reveals.forEach((el) => observer.observe(el));

// Counter animation
function animateCounter(el, target, duration = 1400) {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach((el) => {
          animateCounter(el, parseInt(el.dataset.target, 10));
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// Nav background on scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.style.background =
    window.scrollY > 60
      ? 'rgba(6, 8, 15, 0.92)'
      : 'rgba(6, 8, 15, 0.7)';
});

// Dynamic age & tenure
(function initDynamicDates() {
  const BIRTHDAY = new Date(2003, 5, 11); // 11 Jun 2003
  const CAREER_START = new Date(2023, 2, 1); // Mar 2023, first role
  const OTK_START = new Date(2024, 6, 1); // Jul 2024
  const today = new Date();

  function calcAge(birth, now) {
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  function calcExperienceYears(start, end) {
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    if (months < 0) months = 0;
    const years = Math.floor(months / 12);
    return `${years}+ years`;
  }

  function formatTenure(start, end) {
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    if (months < 0) months = 0;

    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years !== 1 ? 's' : ''}`);
    if (rem > 0) parts.push(`${rem} mo`);
    return parts.join(' ') || '< 1 mo';
  }

  const ageEl = document.getElementById('age-value');
  if (ageEl) ageEl.textContent = calcAge(BIRTHDAY, today);

  const expEl = document.getElementById('experience-value');
  if (expEl) expEl.textContent = calcExperienceYears(CAREER_START, today);

  const tenureEl = document.getElementById('otk-tenure');
  if (tenureEl) tenureEl.textContent = formatTenure(OTK_START, today);
})();

// Experience accordion
document.querySelectorAll('.exp-header').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.exp-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.exp-item').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.exp-header').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Particle network background
(function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, animId;
  const COUNT = window.innerWidth < 768 ? 40 : 70;
  const LINK_DIST = 140;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(62, 232, 197, 0.35)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(62, 232, 197, ${0.06 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });
})();
