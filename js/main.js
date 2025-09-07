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

  // --- Flip Card Click/Tap Functionality ---
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
  
  initFlipCards();

  // --- Enhanced Customer Review Carousel with Swipe Support ---
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

    const nextSlide = () => {
      goToSlide(currentSlide + 1);
    };

    const prevSlide = () => {
      goToSlide(currentSlide - 1);
    };

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

    // Add touch/mouse event listeners
    carouselContainer.addEventListener('touchstart', handleStart, { passive: false });
    carouselContainer.addEventListener('touchmove', handleMove, { passive: false });
    carouselContainer.addEventListener('touchend', handleEnd);
    
    // Mouse events for desktop
    carouselContainer.addEventListener('mousedown', handleStart);
    carouselContainer.addEventListener('mousemove', handleMove);
    carouselContainer.addEventListener('mouseup', handleEnd);
    carouselContainer.addEventListener('mouseleave', handleEnd);
    
    // Prevent text selection during drag
    carouselContainer.addEventListener('selectstart', (e) => e.preventDefault());
    
    // Set cursor style
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
    
    // Make carousel focusable for keyboard navigation
    carouselContainer.tabIndex = 0;
    
    // Pause on hover/focus
    carouselContainer.addEventListener('mouseenter', pauseAutoPlay);
    carouselContainer.addEventListener('mouseleave', resumeAutoPlay);
    carouselContainer.addEventListener('focus', pauseAutoPlay);
    carouselContainer.addEventListener('blur', resumeAutoPlay);

    // Start auto-play
    startAutoPlay();
  };

  // Run carousel initialization if on the home page
  if (
    window.location.pathname.endsWith('home.html') ||
    window.location.pathname.endsWith('/')
  ) {
    initCarousel();
  }

  // --- Scroll-triggered animations for all pages ---
  initScrollAnimations();

  // --- Initialize enhanced scroll animations ---
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

    // Home page specific animations
    if (window.location.pathname.endsWith('home.html') || 
        window.location.pathname.endsWith('/') ||
        window.location.pathname === '') {
      
      // Animate sections as they come into view
      const sections = document.querySelectorAll('.section');
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              // Add staggered entrance animations
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
        // Only animate sections after the hero
        if (index > 0) {
          section.style.opacity = '0';
          section.style.transform = 'translateY(50px)';
          section.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          sectionObserver.observe(section);
        }
      });

      // Enhanced carousel container animation
      const carouselContainer = document.querySelector('.carousel-container');
      if (carouselContainer) {
        const carouselObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'scale(1)';
                entry.target.classList.add('glass-card');
              }
            });
          },
          { threshold: 0.3 }
        );

        carouselContainer.style.opacity = '0';
        carouselContainer.style.transform = 'scale(0.95)';
        carouselContainer.style.transition = 'all 0.6s ease-out';
        carouselObserver.observe(carouselContainer);
      }

      // New Home Page Specific Animations
      
      // Journey steps staggered animation
      const journeySteps = document.querySelectorAll('.step');
      const stepObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-bounce-in');
              }, index * 200);
            }
          });
        },
        { threshold: 0.2 }
      );

      journeySteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(50px)';
        step.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        stepObserver.observe(step);
      });

      // Gift box animation on scroll
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

      // Theme showcase animation
      const themeShowcase = document.querySelector('.theme-showcase');
      if (themeShowcase) {
        const themeObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Animate the theme image with a slight delay
                setTimeout(() => {
                  const themeImage = entry.target.querySelector('.theme-image');
                  if (themeImage) {
                    themeImage.style.opacity = '1';
                    themeImage.style.transform = 'scale(1)';
                  }
                }, 300);
              }
            });
          },
          { threshold: 0.2 }
        );

        themeShowcase.style.opacity = '0';
        themeShowcase.style.transform = 'translateY(30px)';
        themeShowcase.style.transition = 'all 0.8s ease-out';
        themeObserver.observe(themeShowcase);

        // Initialize theme image animation
        const themeImage = themeShowcase.querySelector('.theme-image');
        if (themeImage) {
          themeImage.style.opacity = '0';
          themeImage.style.transform = 'scale(0.9)';
          themeImage.style.transition = 'all 0.6s ease-out';
        }
      }

      // Screen vs Letter Time animation
      const comparisonContainer = document.querySelector('.comparison-container');
      if (comparisonContainer) {
        const comparisonObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Animate screen side first
                const screenSide = entry.target.querySelector('.screen-side');
                const letterSide = entry.target.querySelector('.letter-side');
                const arrow = entry.target.querySelector('.transition-arrow');
                
                setTimeout(() => {
                  if (screenSide) {
                    screenSide.style.opacity = '1';
                    screenSide.style.transform = 'translateX(0)';
                  }
                }, 100);
                
                setTimeout(() => {
                  if (arrow) {
                    arrow.style.opacity = '1';
                    arrow.style.transform = 'scale(1)';
                  }
                }, 800);
                
                setTimeout(() => {
                  if (letterSide) {
                    letterSide.style.opacity = '1';
                    letterSide.style.transform = 'translateX(0)';
                  }
                }, 1200);
              }
            });
          },
          { threshold: 0.3 }
        );

        // Initialize hidden state
        const screenSide = comparisonContainer.querySelector('.screen-side');
        const letterSide = comparisonContainer.querySelector('.letter-side');
        const arrow = comparisonContainer.querySelector('.transition-arrow');
        
        if (screenSide) {
          screenSide.style.opacity = '0';
          screenSide.style.transform = 'translateX(-50px)';
          screenSide.style.transition = 'all 0.8s ease-out';
        }
        
        if (letterSide) {
          letterSide.style.opacity = '0';
          letterSide.style.transform = 'translateX(50px)';
          letterSide.style.transition = 'all 0.8s ease-out';
        }
        
        if (arrow) {
          arrow.style.opacity = '0';
          arrow.style.transform = 'scale(0.5)';
          arrow.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }

        comparisonObserver.observe(comparisonContainer);
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
    }

    // Progressive content reveal with staggered timing
    const missionItems = document.querySelectorAll('.mission-list li');
    const missionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-slide-in-left');
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateX(0)';
            }, index * 200);
          }
        });
      },
      { threshold: 0.3 }
    );

    missionItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-50px)';
      item.style.transition = 'all 0.6s ease-out';
      missionObserver.observe(item);
    });

    // Feature cards with bounce effect
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
  }

  // --- Enhanced mobile optimizations ---
  initMobileOptimizations();
  initInteractiveElements();

  // --- Mobile-specific optimizations ---
  function initMobileOptimizations() {
    const isMobile = window.innerWidth <= 768;
    const isTouch = 'ontouchstart' in window;
    
    if (isMobile || isTouch) {
      // Enhanced touch feedback
      document.body.classList.add('touch-device');
      
      // Optimize scroll performance
      let scrollTimer = null;
      window.addEventListener('scroll', () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
          scrollTimer = null;
        }, 16); // 60fps throttling
      }, { passive: true });

      // Add touch-specific interactions
      const interactiveElements = document.querySelectorAll('.btn, .card, .dot, .nav-link');
      
      interactiveElements.forEach(element => {
        // Touch feedback with scale animation
        element.addEventListener('touchstart', (e) => {
          element.style.transform = 'scale(0.95)';
          element.style.transition = 'transform 0.1s ease';
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
          setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
          }, 100);
        }, { passive: true });

        element.addEventListener('touchcancel', (e) => {
          element.style.transform = '';
          element.style.transition = '';
        }, { passive: true });
      });

      // Prevent zoom on double tap for carousel only (not buttons)
      const preventZoomElements = document.querySelectorAll('.carousel-container');
      preventZoomElements.forEach(element => {
        element.addEventListener('touchend', (e) => {
          e.preventDefault();
        });
      });

      // Optimize images for mobile
      const images = document.querySelectorAll('img');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.style.willChange = 'transform';
            setTimeout(() => {
              img.style.willChange = 'auto';
            }, 1000);
          }
        });
      });

      images.forEach(img => {
        imageObserver.observe(img);
      });

      // Enhanced viewport detection
      const updateViewport = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      updateViewport();
      window.addEventListener('resize', updateViewport);
      window.addEventListener('orientationchange', () => {
        setTimeout(updateViewport, 100);
      });

      // Improve touch scrolling
      document.body.style.WebkitOverflowScrolling = 'touch';
      
      // Add momentum scrolling for iOS
      const scrollableElements = document.querySelectorAll('.carousel-container, .section');
      scrollableElements.forEach(element => {
        element.style.WebkitOverflowScrolling = 'touch';
      });

      // Performance optimization for animations on mobile
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        document.documentElement.style.setProperty('--transition-base', '0.01ms');
        document.documentElement.style.setProperty('--transition-fast', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
      }
    }
  }

  function initInteractiveElements() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((btn) => {
      btn.addEventListener('touchstart', createRipple);
      btn.addEventListener('click', createRipple);
    });

    function createRipple(e) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.touches
        ? e.touches[0].clientX - rect.left
        : e.clientX - rect.left;
      const y = e.touches
        ? e.touches[0].clientY - rect.top
        : e.clientY - rect.top;

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
    cards.forEach((card) => {
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
