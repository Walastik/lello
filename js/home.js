/* ================== HOME PAGE SPECIFIC FUNCTIONALITY ================== */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize home-specific features
  initFlipCards();
  initCarousel();
  initScrollAnimations();
  initHomeAnimations();
});

/* === FLIP CARD FUNCTIONALITY === */
function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');
  
  flipCards.forEach(card => {
    // Add click/tap event listener
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
    
    // Add keyboard support (Enter and Space keys)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
    
    // Make cards focusable for keyboard navigation
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
    
    // Add aria-label for accessibility
    if (!card.hasAttribute('aria-label')) {
      card.setAttribute('aria-label', 'Click to flip card and see more details');
    }
  });
}

/* === ENHANCED CUSTOMER REVIEW CAROUSEL === */
const initCarousel = () => {
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  const carouselContainer = document.querySelector('.carousel-container');
  if (!slides.length || !dotsContainer || !carouselContainer) return;

  let currentSlide = 0;
  let isAutoPlaying = true;
  let autoPlayTimer;

  // Touch/swipe variables
  let startX = null;
  let startY = null;
  let isMouseDown = false;
  let isDragging = false;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      pauseAutoPlay();
      goToSlide(i);
      resumeAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.dot');

  const goToSlide = (slideIndex) => {
    if (slideIndex < 0) slideIndex = slides.length - 1;
    if (slideIndex >= slides.length) slideIndex = 0;
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = slideIndex;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  const pauseAutoPlay = () => {
    isAutoPlaying = false;
    if (autoPlayTimer) clearTimeout(autoPlayTimer);
  };

  const resumeAutoPlay = () => {
    if (autoPlayTimer) clearTimeout(autoPlayTimer);
    autoPlayTimer = setTimeout(() => {
      isAutoPlaying = true;
      startAutoPlay();
    }, 3000);
  };

  const startAutoPlay = () => {
    if (autoPlayTimer) clearTimeout(autoPlayTimer);
    autoPlayTimer = setTimeout(() => {
      if (isAutoPlaying) {
        nextSlide();
        startAutoPlay();
      }
    }, 5000);
  };

  // Touch event handlers
  const handleStart = (e) => {
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    isMouseDown = e.type === 'mousedown';
    isDragging = false;
    pauseAutoPlay();
    
    carouselContainer.style.cursor = 'grabbing';
    carouselContainer.style.transition = 'none';
  };

  const handleMove = (e) => {
    if (!startX || (!isMouseDown && e.type === 'mousemove')) return;
    
    e.preventDefault();
    
    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const diffX = startX - currentX;
    const diffY = startY - currentY;
    
    // Only horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isDragging = true;
      
      // Add visual feedback during swipe
      const currentSlideEl = slides[currentSlide];
      const opacity = Math.max(0.5, 1 - Math.abs(diffX) / 200);
      currentSlideEl.style.opacity = opacity;
      currentSlideEl.style.transform = `translateX(${-diffX * 0.5}px) scale(${0.95 + opacity * 0.05})`;
    }
  };

  const handleEnd = (e) => {
    if (!startX) return;
    
    const endX = e.type === 'mouseup' || e.type === 'mouseleave' ? 
      (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) :
      e.changedTouches[0].clientX;
    
    const diffX = startX - endX;
    const threshold = 50;
    
    carouselContainer.style.cursor = 'grab';
    carouselContainer.style.transition = '';
    
    // Reset current slide appearance
    const currentSlideEl = slides[currentSlide];
    currentSlideEl.style.opacity = '';
    currentSlideEl.style.transform = '';
    
    if (isDragging && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextSlide(); // Swipe left - next slide
      } else {
        prevSlide(); // Swipe right - previous slide
      }
    }
    
    startX = null;
    startY = null;
    isMouseDown = false;
    isDragging = false;
    resumeAutoPlay();
  };

  // Add event listeners
  carouselContainer.addEventListener('touchstart', handleStart, { passive: false });
  carouselContainer.addEventListener('touchmove', handleMove, { passive: false });
  carouselContainer.addEventListener('touchend', handleEnd);
  carouselContainer.addEventListener('mousedown', handleStart);
  carouselContainer.addEventListener('mousemove', handleMove);
  carouselContainer.addEventListener('mouseup', handleEnd);
  carouselContainer.addEventListener('mouseleave', handleEnd);
  carouselContainer.addEventListener('selectstart', (e) => e.preventDefault());
  
  carouselContainer.style.cursor = 'grab';
  carouselContainer.style.userSelect = 'none';
  
  // Keyboard navigation
  carouselContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      pauseAutoPlay();
      prevSlide();
      resumeAutoPlay();
    } else if (e.key === 'ArrowRight') {
      pauseAutoPlay();
      nextSlide();
      resumeAutoPlay();
    }
  });
  
  carouselContainer.tabIndex = 0;
  
  // Pause on hover/focus
  carouselContainer.addEventListener('mouseenter', pauseAutoPlay);
  carouselContainer.addEventListener('mouseleave', resumeAutoPlay);
  carouselContainer.addEventListener('focus', pauseAutoPlay);
  carouselContainer.addEventListener('blur', resumeAutoPlay);

  // Start auto-play
  startAutoPlay();
};

/* === SCROLL ANIMATIONS === */
function initScrollAnimations() {
  // Generic scroll reveal elements
  const scrollElements = document.querySelectorAll('.scroll-reveal');
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

  // Modern scroll animation variants
  const animationClasses = [
    'scroll-reveal-fade',
    'scroll-reveal-scale', 
    'scroll-reveal-slide-left',
    'scroll-reveal-slide-right',
    'scroll-reveal-rotate'
  ];

  animationClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    elements.forEach((el) => {
      observer.observe(el);
    });
  });

  // Staggered children animations
  const staggeredContainers = document.querySelectorAll('.stagger-children-enhanced');
  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  staggeredContainers.forEach((container) => {
    staggerObserver.observe(container);
  });
}

/* === HOME PAGE SPECIFIC ANIMATIONS === */
function initHomeAnimations() {
  // Animate sections as they come into view
  const sections = document.querySelectorAll('.section');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('animate-fade-in');
          }, index * 200);
        }
      });
    },
    { 
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    }
  );

  sections.forEach((section, index) => {
    if (index > 0) { // Skip hero section
      section.style.opacity = '0';
      section.style.transform = 'translateY(50px)';
      section.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      sectionObserver.observe(section);
    }
  });

  // Home page specific element animations
  initializeHomeElements();
}

function initializeHomeElements() {
  // Gift box animation
  const giftBox = document.querySelector('.gift-box');
  if (giftBox) {
    const giftBoxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1) rotate(0deg)';
            entry.target.classList.add('animate-bounce-in');
          }
        });
      },
      { threshold: 0.3 }
    );

    giftBox.style.opacity = '0';
    giftBox.style.transform = 'scale(0.8) rotate(-5deg)';
    giftBox.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    giftBoxObserver.observe(giftBox);
  }

  // Parallax effect for hero elements
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    let heroTicking = false;
    
    function updateHeroParallax() {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.5;
      heroContent.style.transform = `translateY(${rate}px)`;
      heroTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        requestAnimationFrame(updateHeroParallax);
        heroTicking = true;
      }
    });
  }

  // CTA button special animation
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'scale(1) translateY(0)';
              entry.target.classList.add('animate-pulse');
            }, 200);
          }
        });
      },
      { threshold: 0.5 }
    );

    ctaButton.style.opacity = '0';
    ctaButton.style.transform = 'scale(0.9) translateY(20px)';
    ctaButton.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    ctaObserver.observe(ctaButton);
  }
}