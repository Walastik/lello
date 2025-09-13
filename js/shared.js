/* ================== SHARED FUNCTIONALITY ================== */
/* Core functionality used across all pages */

document.addEventListener('DOMContentLoaded', function () {
  // --- Load Header and Footer ---
  loadHeaderFooter();

  // --- Initialize Navigation ---
  initializeNavigation();

  // --- Add Event Delegation Fallback for Mobile Menu ---
  setupEventDelegation();

  // --- Initialize Scroll Animations ---
  initializeScrollAnimations();

  // --- Enhanced Mobile Optimizations ---
  initializeMobileOptimizations();

  // --- Interactive Elements ---
  initializeInteractiveElements();
});

/* === HEADER/FOOTER LOADER === */
const loadHeaderFooter = () => {
  const loadHTML = (selector, url) => {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        document.querySelector(selector).innerHTML = data;
        // After loading header, attach mobile menu events with longer delay
        if (selector === 'header') {
          // Use multiple approaches to ensure menu is attached
          setTimeout(() => attachNavEvents(), 200);
          setTimeout(() => attachNavEvents(), 500);
          // Also try on next tick
          requestAnimationFrame(() => {
            setTimeout(() => attachNavEvents(), 100);
          });
        }
      });
  };

  loadHTML('header', 'templates/header.html');
  loadHTML('footer', 'templates/footer.html');
};

/* === EVENT DELEGATION FOR MOBILE MENU === */
const setupEventDelegation = () => {
  document.addEventListener(
    'click',
    function (e) {
      const hamburgerClick =
        e.target.matches('.hamburger') ||
        e.target.matches('.hamburger *') ||
        e.target.closest('.hamburger');

      if (hamburgerClick) {
        e.preventDefault();
        e.stopPropagation();

        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
          hamburger.classList.toggle('active');
          navMenu.classList.toggle('active');
        }
      }

      // Close menu when nav links are clicked
      if (e.target.closest('.nav-link')) {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
      }
    },
    true
  ); // Use capture phase
};

/* === NAVIGATION FUNCTIONALITY === */
const initializeNavigation = () => {
  const tryAttachNav = (attempts = 0) => {
    if (attempts > 10) return;

    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      attachNavEvents();
    } else {
      setTimeout(() => tryAttachNav(attempts + 1), 100);
    }
  };

  tryAttachNav();
};

const attachNavEvents = () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu && !hamburger.hasAttribute('data-nav-initialized')) {
    hamburger.setAttribute('data-nav-initialized', 'true');

    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    };

    hamburger.addEventListener('click', toggleMenu);

    document.querySelectorAll('.nav-link').forEach((link) =>
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      })
    );
  }

  // --- Active Page Link Styling ---
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname.split('/').pop();

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href');
    if (
      linkPath === currentPath ||
      (currentPath === '' && linkPath === 'index.html')
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

/* === MOBILE OPTIMIZATIONS === */
const initializeMobileOptimizations = () => {
  const isMobile = window.innerWidth <= 768;
  const isTouch = 'ontouchstart' in window;

  if (isMobile || isTouch) {
    document.body.classList.add('touch-device');

    let scrollTimer = null;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
          scrollTimer = null;
        }, 16); // 60fps throttling
      },
      { passive: true }
    );

    const interactiveElements = document.querySelectorAll(
      '.btn, .card, .dot, .nav-link'
    );

    interactiveElements.forEach((element) => {
      element.addEventListener(
        'touchstart',
        (e) => {
          element.style.transform = 'scale(0.95)';
          element.style.transition = 'transform 0.1s ease';
        },
        { passive: true }
      );

      element.addEventListener(
        'touchend',
        (e) => {
          setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
          }, 100);
        },
        { passive: true }
      );

      element.addEventListener(
        'touchcancel',
        (e) => {
          element.style.transform = '';
          element.style.transition = '';
        },
        { passive: true }
      );
    });

    const updateViewport = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewport, 100);
    });

    document.body.style.WebkitOverflowScrolling = 'touch';

    // Performance optimization for animations on mobile
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty('--transition-base', '0.01ms');
      document.documentElement.style.setProperty('--transition-fast', '0.01ms');
      document.documentElement.style.setProperty('--transition-slow', '0.01ms');
    }
  }
};

/* === INTERACTIVE ELEMENTS === */
const initializeInteractiveElements = () => {
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach((btn) => {
    btn.addEventListener('touchstart', createRipple);
    btn.addEventListener('click', createRipple);
  });

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let navbarTicking = false;

    function updateNavbar() {
      const scrolled = window.pageYOffset;
      if (scrolled > 50) {
        navbar.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      } else {
        navbar.style.boxShadow = 'var(--shadow)';
      }
      navbarTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!navbarTicking) {
        requestAnimationFrame(updateNavbar);
        navbarTicking = true;
      }
    });
  }
};

/* === SCROLL ANIMATIONS === */
const initializeScrollAnimations = () => {
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  if (scrollElements.length === 0) return;

  const scrollReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  scrollElements.forEach((el) => {
    scrollReveal.observe(el);
  });

  const featureCards = document.querySelectorAll('.card-feature');
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-bounce-in');
            entry.target.style.opacity = '1';
          }, index * 300);
        }
      });
    },
    { threshold: 0.2 }
  );

  featureCards.forEach((card, index) => {
    card.style.opacity = '0';
    cardObserver.observe(card);
  });
};

/* === UTILITY FUNCTIONS === */
function createRipple(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.touches
    ? e.touches[0].clientX - rect.left
    : e.clientX - rect.left;
  const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    width: ${size}px;
    height: ${size}px;
    left: ${x - size / 2}px;
    top: ${y - size / 2}px;
  `;

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
