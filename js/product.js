/* ================== PRODUCT PAGE INTERACTIONS ================== */

document.addEventListener('DOMContentLoaded', function () {
  initializeProductGallery();
  initializeProductAnimations();
  initializeProductMobileOptimizations();
});

/* === PRODUCT GALLERY FUNCTIONALITY === */
function initializeProductGallery() {
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');

  if (!mainImage || thumbnails.length === 0) return;

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', function () {
      thumbnails.forEach((thumb) => thumb.classList.remove('active'));

      this.classList.add('active');

      const newSrc = this.getAttribute('data-src');
      updateMainImage(mainImage, newSrc);
    });

    thumbnail.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });

    // Add tabindex for keyboard accessibility
    thumbnail.setAttribute('tabindex', '0');
  });

  // Handle keyboard navigation between thumbnails
  let currentIndex = 0;
  document.addEventListener('keydown', function (e) {
    if (e.target.classList.contains('thumbnail')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % thumbnails.length;
        thumbnails[currentIndex].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        currentIndex =
          (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        thumbnails[currentIndex].focus();
      }
    }
  });
}

/* === SMOOTH IMAGE TRANSITION === */
function updateMainImage(imgElement, newSrc) {
  const tempImg = new Image();

  tempImg.onload = function () {
    imgElement.style.opacity = '0.5';
    imgElement.style.transform = 'scale(0.95)';

    setTimeout(() => {
      imgElement.src = newSrc;
      imgElement.style.opacity = '1';
      imgElement.style.transform = 'scale(1)';
    }, 200);
  };

  tempImg.onerror = function () {
    imgElement.src = newSrc;
  };

  tempImg.src = newSrc;
}

/* === PRODUCT ANIMATIONS === */
function initializeProductAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    '.content-item, .description-content'
  );
  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Stagger animation for content grid items
  const contentItems = document.querySelectorAll('.content-item');
  contentItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
  });
}

/* === MOBILE OPTIMIZATIONS === */
function initializeProductMobileOptimizations() {
  // Touch feedback for mobile buttons
  const buttons = document.querySelectorAll('.btn, .thumbnail');

  buttons.forEach((button) => {
    button.addEventListener('touchstart', function () {
      this.style.transform = 'scale(0.98)';
    });

    button.addEventListener('touchend', function () {
      this.style.transform = '';
    });
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Handle resize events for responsive adjustments
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      adjustForViewport();
    }, 250);
  });

  // Initial viewport adjustment
  adjustForViewport();
}

/* === VIEWPORT ADJUSTMENTS === */
function adjustForViewport() {
  const isMobile = window.innerWidth <= 768;
  const productGallery = document.querySelector('.product-gallery');

  if (productGallery) {
    if (isMobile) {
      productGallery.style.position = 'static';
    } else {
      productGallery.style.position = 'sticky';
    }
  }

  // Adjust thumbnail grid on very small screens
  if (window.innerWidth <= 480) {
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');
    if (thumbnailGallery) {
      thumbnailGallery.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
  }
}

/* === ENHANCED ACCESSIBILITY === */
function initializeAccessibility() {
  // Add ARIA labels to thumbnails
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.setAttribute('aria-label', `Product image ${index + 1}`);
    thumbnail.setAttribute('role', 'button');
  });

  // Add ARIA live region for image updates
  const mainImage = document.getElementById('mainImage');
  if (mainImage) {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'image-update-announce';
    document.body.appendChild(liveRegion);

    // Update live region when main image changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'src'
        ) {
          const activeThumb = document.querySelector('.thumbnail.active');
          if (activeThumb) {
            liveRegion.textContent = `Now showing: ${activeThumb.alt}`;
          }
        }
      });
    });

    observer.observe(mainImage, {
      attributes: true,
      attributeFilter: ['src'],
    });
  }
}

/* === ORDER BUTTON ENHANCEMENTS === */
function enhanceOrderButton() {
  const orderButtons = document.querySelectorAll('.btn-order, .cta-button');

  orderButtons.forEach((button) => {
    // Add loading state functionality
    button.addEventListener('click', function (e) {
      if (!this.classList.contains('loading')) {
        this.classList.add('loading');
        const originalText = this.textContent;
        this.textContent = 'Processing...';

        // Reset after a short delay (in real implementation, this would be after form submission)
        setTimeout(() => {
          this.classList.remove('loading');
          this.textContent = originalText;
        }, 1000);
      }
    });

    // Add ripple effect for better feedback
    button.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/* === PERFORMANCE OPTIMIZATIONS === */
function optimizePerformance() {
  // Note: Disabled lazy loading for thumbnails since we need data-src attributes for click functionality
  // Thumbnails are already loaded with src attributes, so lazy loading isn't needed
}

/* === INITIALIZATION === */
// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function () {
  initializeAccessibility();
  enhanceOrderButton();
  optimizePerformance();
});

/* === CSS ANIMATION DEFINITIONS === */
const productStyles = document.createElement('style');
productStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
    }
`;
document.head.appendChild(productStyles);
