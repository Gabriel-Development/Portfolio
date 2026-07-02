// =============================================
// THEME TOGGLE
// =============================================

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const STORAGE_KEY = 'portfolio-theme';

const savedTheme = localStorage.getItem(STORAGE_KEY);
if (savedTheme) {
  html.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  html.setAttribute('data-theme', 'light');
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);
  updateNavbarColor();
});

function updateNavbarColor() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const scrolled = window.scrollY > 20;
  navbar.style.backgroundColor = isDark
    ? (scrolled ? 'rgba(15, 15, 15, 0.97)' : 'rgba(15, 15, 15, 0.85)')
    : (scrolled ? 'rgba(245, 243, 239, 0.97)' : 'rgba(245, 243, 239, 0.85)');
}

// =============================================
// EMAIL COPY TO CLIPBOARD
// =============================================

const emailBtn = document.getElementById('emailBtn');

if (emailBtn) {
  emailBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = emailBtn.querySelector('.email-text').textContent.trim();
    const hoverSpan = emailBtn.querySelector('.email-hover');
    const originalText = hoverSpan.textContent;

    try {
      await navigator.clipboard.writeText(email);
      hoverSpan.textContent = 'Copied!';
      emailBtn.style.backgroundColor = '#7a9e7a';

      setTimeout(() => {
        hoverSpan.textContent = originalText;
        emailBtn.style.backgroundColor = '';
      }, 2000);

    } catch (err) {
      const range = document.createRange();
      range.selectNode(emailBtn.querySelector('.email-text'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      hoverSpan.textContent = 'Ctrl+C to copy';

      setTimeout(() => {
        hoverSpan.textContent = originalText;
        window.getSelection().removeAllRanges();
      }, 3000);
    }
  });
}

// =============================================
// FLOATING PARTICLES (HERO)
// =============================================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 150 };
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.baseX += this.vx;
    this.baseY += this.vy;

    if (this.baseX < 0) this.baseX = canvas.width;
    if (this.baseX > canvas.width) this.baseX = 0;
    if (this.baseY < 0) this.baseY = canvas.height;
    if (this.baseY > canvas.height) this.baseY = 0;

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    if (distance < mouse.radius) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 20;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 20;
      }
    }
  }

  draw() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark
      ? `rgba(200, 184, 154, ${this.opacity})`
      : `rgba(139, 115, 85, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 1000), 350);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const maxDistance = 100;

  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        let opacity = 1 - (distance / maxDistance);
        ctx.strokeStyle = isDark
          ? `rgba(200, 184, 154, ${opacity * 0.08})`
          : `rgba(139, 115, 85, ${opacity * 0.08})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  connectParticles();
  animationId = requestAnimationFrame(animateParticles);
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

resizeCanvas();
initParticles();
animateParticles();

// =============================================
// NOISE / GRAIN OVERLAY — SCROLL REACTIVE
// =============================================

const noiseOverlay = document.getElementById('noiseOverlay');

let lastScrollY = window.scrollY;
let currentNoiseOpacity = 0.035;
let targetNoiseOpacity = 0.035;
let noiseAnimFrame;

const NOISE_BASE_OPACITY = 0.035;
const NOISE_PEAK_OPACITY = 0.09;
const NOISE_BASE_SIZE = 180;
const NOISE_PEAK_SIZE = 140;
let currentNoiseSize = NOISE_BASE_SIZE;

function tickNoise() {
  const currentScrollY = window.scrollY;
  const rawVelocity = Math.abs(currentScrollY - lastScrollY);
  lastScrollY = currentScrollY;

  const isDark = html.getAttribute('data-theme') === 'dark';
  const baseOpacity = isDark ? 0.035 : 0.045;
  const peakOpacity = isDark ? NOISE_PEAK_OPACITY : NOISE_PEAK_OPACITY * 1.2;

  const velocityClamped = Math.min(rawVelocity, 60);
  const velocityRatio = velocityClamped / 60;

  targetNoiseOpacity = baseOpacity + velocityRatio * (peakOpacity - baseOpacity);
  const targetSize = NOISE_BASE_SIZE - velocityRatio * (NOISE_BASE_SIZE - NOISE_PEAK_SIZE);

  currentNoiseOpacity += (targetNoiseOpacity - currentNoiseOpacity) * 0.12;
  currentNoiseSize += (targetSize - currentNoiseSize) * 0.1;

  noiseOverlay.style.opacity = currentNoiseOpacity.toFixed(4);
  noiseOverlay.style.backgroundSize = `${Math.round(currentNoiseSize)}px ${Math.round(currentNoiseSize)}px`;

  requestAnimationFrame(tickNoise);
}

tickNoise();

// =============================================
// TEXT SCRAMBLE ON SCROLL REVEAL
// =============================================

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?';

function scrambleElement(el) {
  const original = el.getAttribute('data-original-text') || el.textContent.trim();
  el.setAttribute('data-original-text', original);

  const totalDuration = 700;
  const frameInterval = 35;
  const totalFrames = Math.floor(totalDuration / frameInterval);
  let frame = 0;

  el.classList.add('scrambling');

  const tick = setInterval(() => {
    const progress = frame / totalFrames;

    el.textContent = original
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        const charRevealThreshold = i / original.length;
        if (progress > charRevealThreshold + 0.15) {
          return char;
        }
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join('');

    frame++;

    if (frame >= totalFrames) {
      el.textContent = original;
      el.classList.remove('scrambling');
      clearInterval(tick);
    }
  }, frameInterval);
}

// =============================================
// SCROLL REVEAL ANIMATION (with scramble hook)
// =============================================

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      if (entry.target.hasAttribute('data-scramble')) {
        scrambleElement(entry.target);
      }

      entry.target.querySelectorAll('[data-scramble]').forEach(scrambleEl => {
        setTimeout(() => scrambleElement(scrambleEl), 120);
      });

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// =============================================
// ACTIVE NAV LINK ON SCROLL
// =============================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserverOptions = {
  root: null,
  rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-height')} 0px -50% 0px`,
  threshold: 0
};

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, navObserverOptions);

sections.forEach(section => navObserver.observe(section));

// =============================================
// MOBILE NAV MENU
// =============================================

const navHamburger = document.getElementById('navHamburger');
const navClose = document.getElementById('navClose');
const navOverlay = document.getElementById('navOverlay');
const navMenu = document.getElementById('navMenu');
const navMobileLinks = document.querySelectorAll('.nav-mobile-link');

function openMobileMenu() {
  if (!navMenu || !navOverlay || !navHamburger) return;
  navMenu.classList.add('active');
  navOverlay.classList.add('active');
  navHamburger.setAttribute('aria-expanded', 'true');
  navMenu.setAttribute('aria-hidden', 'false');
  navOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (!navMenu || !navOverlay || !navHamburger) return;
  navMenu.classList.remove('active');
  navOverlay.classList.remove('active');
  navHamburger.setAttribute('aria-expanded', 'false');
  navMenu.setAttribute('aria-hidden', 'true');
  navOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (navHamburger) navHamburger.addEventListener('click', openMobileMenu);
if (navClose) navClose.addEventListener('click', closeMobileMenu);
if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

navMobileLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// =============================================
// MAGNETIC BUTTON EFFECT
// =============================================

const isTouch = window.matchMedia('(pointer: coarse)').matches;

if (!isTouch) {
  const magneticBtns = document.querySelectorAll('.magnetic');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.25;
      const deltaY = (e.clientY - centerY) * 0.25;
      btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      btn.style.transition = 'transform 0.4s ease';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease';
    });
  });
}

// =============================================
// INK DROP / RIPPLE ON CLICK
// =============================================

const rippleBtns = document.querySelectorAll('.magnetic');

rippleBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  .ripple {
    position: absolute;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    transform: translate(-50%, -50%);
    animation: ripple-expand 0.6s ease-out forwards;
    pointer-events: none;
  }
  @keyframes ripple-expand {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// =============================================
// NAVBAR BACKGROUND OPACITY ON SCROLL
// =============================================

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.backgroundColor = html.getAttribute('data-theme') === 'dark'
      ? 'rgba(15, 15, 15, 0.97)'
      : 'rgba(245, 243, 239, 0.97)';
  } else {
    navbar.style.backgroundColor = html.getAttribute('data-theme') === 'dark'
      ? 'rgba(15, 15, 15, 0.85)'
      : 'rgba(245, 243, 239, 0.85)';
  }
});

// =============================================
// PARALLAX SCROLL EFFECT FOR HERO
// =============================================

const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.6));
  }
});

// =============================================
// PROJECT CAROUSELS
// =============================================

document.querySelectorAll('.project-visual.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dots = carousel.querySelectorAll('.carousel-dot');

  let currentIndex = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    // Wrap around
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    currentIndex = index;

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Arrow clicks
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
    });
  }

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(i);
    });
  });

  // Keyboard navigation when carousel is focused/hovered
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.stopPropagation();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.stopPropagation();
      nextSlide();
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });
});

// =============================================
// EXPANDABLE DETAIL PANELS
// =============================================

let currentlyExpanded = null;

function openPanel(el) {
  const panel = el.querySelector('.detail-panel');
  if (!panel) return;

  el.classList.add('expanded');
  el.setAttribute('aria-expanded', 'true');
  panel.setAttribute('aria-hidden', 'false');

  const elTop = el.getBoundingClientRect().top + window.scrollY;
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
  const targetScroll = elTop - navHeight - 24;

  if (targetScroll < window.scrollY || elTop < window.scrollY + navHeight + 24) {
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }

  currentlyExpanded = el;
}

function closePanel(el) {
  const panel = el.querySelector('.detail-panel');
  if (!panel) return;

  el.classList.remove('expanded');
  el.setAttribute('aria-expanded', 'false');
  panel.setAttribute('aria-hidden', 'true');

  if (currentlyExpanded === el) {
    currentlyExpanded = null;
  }
}

function togglePanel(el) {
  if (el.classList.contains('expanded')) {
    closePanel(el);
  } else {
    if (currentlyExpanded && currentlyExpanded !== el) {
      closePanel(currentlyExpanded);
    }
    openPanel(el);
  }
}

document.querySelectorAll('.expandable').forEach(el => {
  el.addEventListener('click', (e) => {
    if (e.target.closest('.detail-link')) return;
    togglePanel(el);
  });

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePanel(el);
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentlyExpanded) {
    closePanel(currentlyExpanded);
  }
});
