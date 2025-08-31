document.addEventListener('DOMContentLoaded', function () {
  // --- Load Header and Footer ---
  const loadHTML = (selector, url) => {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        document.querySelector(selector).innerHTML = data;
        // After loading header, attach mobile menu events
        if (selector === 'header') {
          attachNavEvents();
        }
      })
      .catch((error) => console.error(`Error loading ${url}:`, error));
  };

  loadHTML('header', 'templates/header.html');
  loadHTML('footer', 'templates/footer.html');

  // --- Mobile Menu (Hamburger) Functionality ---
  const attachNavEvents = () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      document.querySelectorAll('.nav-link').forEach((n) =>
        n.addEventListener('click', () => {
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

  // Removed conflicting scroll listener that was causing jittering

  // --- Customer Review Carousel ---
  const initCarousel = () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    if (!slides.length || !dotsContainer) return;

    let currentSlide = 0;

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    const goToSlide = (slideIndex) => {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = slideIndex;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    };

    // Auto-play
    setInterval(() => {
      let nextSlide = (currentSlide + 1) % slides.length;
      goToSlide(nextSlide);
    }, 5000); // Change slide every 5 seconds
  };

  // Run carousel initialization if on the home page
  if (
    window.location.pathname.endsWith('home.html') ||
    window.location.pathname.endsWith('/')
  ) {
    initCarousel();
  }

  // --- Scroll-triggered animations for About page ---
  if (window.location.pathname.endsWith('about.html')) {
    initScrollAnimations();
  }

  // --- Initialize scroll animations ---
  function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    const scrollReveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    scrollElements.forEach((el) => {
      scrollReveal.observe(el);
    });

    // Progressive content reveal with staggered timing
    const missionItems = document.querySelectorAll('.mission-list li');
    const missionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-slide-in-left');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
          }, index * 200);
        }
      });
    }, { threshold: 0.3 });

    missionItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-50px)';
      item.style.transition = 'all 0.6s ease-out';
      missionObserver.observe(item);
    });

    // Feature cards with bounce effect
    const featureCards = document.querySelectorAll('.card-feature');
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-bounce-in');
            entry.target.style.opacity = '1';
          }, index * 300);
        }
      });
    }, { threshold: 0.2 });

    featureCards.forEach((card, index) => {
      card.style.opacity = '0';
      cardObserver.observe(card);
    });

    // Solution reveal with special effect
    const solutionReveal = document.querySelector('.solution-reveal');
    if (solutionReveal) {
      const solutionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-bounce-in', 'animate-pulse');
          }
        });
      }, { threshold: 0.3 });
      
      solutionObserver.observe(solutionReveal);
    }
  }

  // --- Interactive enhancements for mobile ---
  initInteractiveElements();

  function initInteractiveElements() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('touchstart', createRipple);
      btn.addEventListener('click', createRipple);
    });

    function createRipple(e) {
      e.preventDefault();
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
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

    // Subtle parallax effect for solution reveal (throttled)
    const solutionReveal = document.querySelector('.solution-reveal');
    if (solutionReveal) {
      let ticking = false;
      
      function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.1; // Reduced intensity
        solutionReveal.style.transform = `translateY(${rate}px)`;
        ticking = false;
      }
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      });
    }

    // Touch-friendly card interactions
    const cards = document.querySelectorAll('.card, .mission-list li');
    cards.forEach(card => {
      card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
      });
      
      card.addEventListener('touchend', () => {
        card.style.transform = '';
      });
    });

    // Simple navbar enhancement without hiding (throttled)
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
  }
});
