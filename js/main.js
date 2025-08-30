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

  let lastScrollTop = 0;
  const header = document.querySelector('header');

  window.addEventListener(
    'scroll',
    function () {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Downscroll
        header.classList.add('hidden');
      } else {
        // Upscroll
        header.classList.remove('hidden');
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    },
    false
  );

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
});
