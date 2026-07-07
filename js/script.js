/**
 * Mohamed Ahmed Portfolio — Main JavaScript
 * Handles animations, interactions, and UI behavior
 */

(function () {
  'use strict';

  /* ==========================================
     DOM Elements
     ========================================== */
  const DOM = {
    loader: document.getElementById('loader'),
    scrollProgress: document.getElementById('scrollProgress'),
    header: document.getElementById('header'),
    navMenu: document.getElementById('navMenu'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.querySelectorAll('.nav__link'),
    themeToggle: document.getElementById('themeToggle'),
    backToTop: document.getElementById('backToTop'),
    cursor: document.getElementById('cursor'),
    cursorFollower: document.getElementById('cursorFollower'),
    mouseGlow: document.getElementById('mouseGlow'),
    particlesCanvas: document.getElementById('particles'),
    typingText: document.getElementById('typingText'),
    reveals: document.querySelectorAll('.reveal'),
    sections: document.querySelectorAll('section[id]'),
    rippleElements: document.querySelectorAll('.ripple'),
    sliderTrack: document.getElementById('sliderTrack'),
    sliderPrev: document.getElementById('sliderPrev'),
    sliderNext: document.getElementById('sliderNext'),
    sliderDots: document.getElementById('sliderDots'),
    slides: document.querySelectorAll('.testimonial-slide')
  };

  /* ==========================================
     Constants
     ========================================== */
  const TYPING_PHRASES = [
    'Data Analyst | BI Fresh Graduate',
    'SQL & Python Enthusiast',
    'Dashboard Builder',
    'Business Intelligence Expert'
  ];
  const THEME_KEY = 'portfolio-theme';
  const SLIDER_INTERVAL = 5000;
  const PARTICLE_COUNT = 60;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentSlide = 0;
  let sliderTimer = null;
  let typingPhraseIndex = 0;
  let typingCharIndex = 0;
  let isDeleting = false;
  let particleAnimationId = null;

  /* ==========================================
     Loading Screen
     ========================================== */
  function initLoader() {
    document.body.classList.add('loading');

    window.addEventListener('load', () => {
      setTimeout(() => {
        DOM.loader.classList.add('hidden');
        document.body.classList.remove('loading');
      }, 2200);
    });
  }

  /* ==========================================
     Theme Toggle (Dark / Light Mode)
     ========================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);

    DOM.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* ==========================================
     Sticky Navbar & Scroll Progress
     ========================================== */
  function initScrollHandlers() {
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      /* Navbar glass effect */
      DOM.header.classList.toggle('scrolled', scrollY > 50);

      /* Scroll progress bar */
      DOM.scrollProgress.style.width = progress + '%';
      DOM.scrollProgress.setAttribute('aria-valuenow', Math.round(progress));

      /* Back to top button */
      DOM.backToTop.classList.toggle('visible', scrollY > 400);
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    DOM.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================
     Mobile Navigation
     ========================================== */
  function initMobileNav() {
    const closeMenu = () => {
      DOM.navMenu.classList.remove('open');
      DOM.navToggle.classList.remove('active');
      DOM.navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    DOM.navToggle.addEventListener('click', () => {
      const isOpen = DOM.navMenu.classList.toggle('open');
      DOM.navToggle.classList.toggle('active', isOpen);
      DOM.navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    DOM.navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ==========================================
     Smooth Scroll & Active Navigation
     ========================================== */
  function initNavigation() {
    DOM.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          DOM.navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, observerOptions);

    DOM.sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ==========================================
     Scroll Reveal (Intersection Observer)
     ========================================== */
  function initScrollReveal() {
    if (prefersReducedMotion) {
      DOM.reveals.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    DOM.reveals.forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================
     Typing Animation
     ========================================== */
  function initTypingAnimation() {
    if (!DOM.typingText || prefersReducedMotion) {
      if (DOM.typingText) {
        DOM.typingText.textContent = TYPING_PHRASES[0];
      }
      return;
    }

    const typeSpeed = 70;
    const deleteSpeed = 40;
    const pauseTime = 2000;

    function type() {
      const currentPhrase = TYPING_PHRASES[typingPhraseIndex];

      if (!isDeleting) {
        DOM.typingText.textContent = currentPhrase.substring(0, typingCharIndex + 1);
        typingCharIndex++;

        if (typingCharIndex === currentPhrase.length) {
          isDeleting = true;
          setTimeout(type, pauseTime);
          return;
        }
      } else {
        DOM.typingText.textContent = currentPhrase.substring(0, typingCharIndex - 1);
        typingCharIndex--;

        if (typingCharIndex === 0) {
          isDeleting = false;
          typingPhraseIndex = (typingPhraseIndex + 1) % TYPING_PHRASES.length;
        }
      }

      setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    }

    type();
  }

  /* ==========================================
     Custom Cursor & Mouse Glow
     ========================================== */
  function initCursorEffects() {
    if (isTouchDevice || prefersReducedMotion) return;

    document.body.classList.add('custom-cursor');

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      DOM.cursor.style.left = mouseX + 'px';
      DOM.cursor.style.top = mouseY + 'px';
      DOM.mouseGlow.style.left = mouseX + 'px';
      DOM.mouseGlow.style.top = mouseY + 'px';
    });

    /* Smooth follower animation */
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;

      DOM.cursorFollower.style.left = followerX + 'px';
      DOM.cursorFollower.style.top = followerY + 'px';

      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    /* Hover state on interactive elements */
    const interactiveElements = document.querySelectorAll(
      'a, button, .skill-card, .project-card, .service-card, .contact-btn'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        DOM.cursor.classList.add('hovering');
        DOM.cursorFollower.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        DOM.cursor.classList.remove('hovering');
        DOM.cursorFollower.classList.remove('hovering');
      });
    });

    document.addEventListener('mouseleave', () => {
      DOM.cursor.style.opacity = '0';
      DOM.cursorFollower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      DOM.cursor.style.opacity = '1';
      DOM.cursorFollower.style.opacity = '0.5';
    });
  }

  /* ==========================================
     Floating Particles Background
     ========================================== */
  function initParticles() {
    if (!DOM.particlesCanvas || prefersReducedMotion) return;

    const canvas = DOM.particlesCanvas;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0;
    let height = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    }

    function getParticleColor() {
      const theme = document.documentElement.getAttribute('data-theme');
      return theme === 'dark' ? '74, 158, 255' : '13, 110, 253';
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const color = getParticleColor();

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + color + ', ' + p.opacity + ')';
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });

      /* Connect nearby particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + color + ', ' + (0.08 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particleAnimationId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  /* ==========================================
     Ripple Effect on Buttons
     ========================================== */
  function initRipple() {
    DOM.rippleElements.forEach((element) => {
      element.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ==========================================
     Testimonial Slider
     ========================================== */
  function initTestimonialSlider() {
    if (!DOM.slides.length) return;

    /* Create pagination dots */
    DOM.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonial-slider__dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (index + 1));
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      DOM.sliderDots.appendChild(dot);
    });

    const dots = DOM.sliderDots.querySelectorAll('.testimonial-slider__dot');

    function goToSlide(index) {
      DOM.slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');

      currentSlide = (index + DOM.slides.length) % DOM.slides.length;

      DOM.slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      sliderTimer = setInterval(nextSlide, SLIDER_INTERVAL);
    }

    function stopAutoplay() {
      if (sliderTimer) {
        clearInterval(sliderTimer);
        sliderTimer = null;
      }
    }

    DOM.sliderNext.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });

    DOM.sliderPrev.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });

    /* Pause on hover */
    const slider = document.getElementById('testimonialSlider');
    if (slider) {
      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
    }

    /* Keyboard navigation */
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('feedback').getBoundingClientRect) return;
      const feedbackRect = document.getElementById('feedback').getBoundingClientRect();
      const inView = feedbackRect.top < window.innerHeight && feedbackRect.bottom > 0;

      if (!inView) return;

      if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoplay();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoplay();
      }
    });

    startAutoplay();
  }

  /* ==========================================
     Lazy Load Images Enhancement
     ========================================== */
  function initLazyImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  /* ==========================================
     Initialize All Modules
     ========================================== */
  function init() {
    initLoader();
    initTheme();
    initScrollHandlers();
    initMobileNav();
    initNavigation();
    initScrollReveal();
    initTypingAnimation();
    initCursorEffects();
    initParticles();
    initRipple();
    initTestimonialSlider();
    initLazyImages();
  }

  /* Run when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
