/**
 * Apple-inspired UI effects and interactions
 * Utilities for implementing smooth, premium, Apple-style effects
 */

/**
 * Initialize magnetic buttons that react to cursor proximity
 * This creates the subtle cursor attraction effect seen on Apple's website
 */
export function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-magnetic');
  
  buttons.forEach(button => {
    button.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = (button as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate position relative to the button's dimensions
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate the distance from center as a percentage
      const distanceX = (x - centerX) / centerX;
      const distanceY = (y - centerY) / centerY;
      
      // Apply subtle transform based on cursor position
      (button as HTMLElement).style.transform = `translate(${distanceX * 4}px, ${distanceY * 4}px)`;
      
      // Update radial gradient position for hover effect
      (button as HTMLElement).style.setProperty('--x', `${(x / rect.width) * 100}%`);
      (button as HTMLElement).style.setProperty('--y', `${(y / rect.height) * 100}%`);
    });

    button.addEventListener('mouseleave', () => {
      (button as HTMLElement).style.transform = 'translate(0, 0)';
    });
  });
}

/**
 * Initialize parallax effect for elements with parallax-container class
 * Creates subtle depth when scrolling, mimicking Apple's premium motion design
 */
export function initParallax() {
  const containers = document.querySelectorAll('.parallax-container');
  
  const handleScroll = () => {
    containers.forEach(container => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Only apply parallax when element is in viewport
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        // Calculate how far the container is through the viewport
        const scrollPercentage = (rect.top / viewportHeight) * 100;
        
        // Apply transform to the background layer
        const parallaxBg = container.querySelector('.parallax-bg');
        if (parallaxBg) {
          (parallaxBg as HTMLElement).style.transform = `translateY(${scrollPercentage * 0.15}px)`;
        }
      }
    });
  };

  // Listen for scroll events, using requestAnimationFrame for performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial call to position elements
  handleScroll();
}

/**
 * Initialize 3D transform effects that respond to mouse movement
 * Creates Apple's signature subtle 3D "floating" card effect
 */
export function init3DTransform() {
  const cards = document.querySelectorAll('.transform-3d-item');
  
  cards.forEach(card => {
    const parent = card.closest('.transform-3d') as HTMLElement;
    if (!parent) return;
    
    parent.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate position as percentage
      const posX = (x / rect.width - 0.5) * 2; // -1 to 1
      const posY = (y / rect.height - 0.5) * 2; // -1 to 1
      
      // Apply rotation based on cursor position
      (card as HTMLElement).style.transform = `
        translateZ(20px)
        rotateX(${posY * -5}deg)
        rotateY(${posX * 5}deg)
      `;
    });
    
    parent.addEventListener('mouseleave', () => {
      (card as HTMLElement).style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
    });
  });
}

/**
 * Initialize subtle animations for elements as they enter the viewport
 * Creates Apple's signature "reveal" animations on scroll
 */
export function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.slide-up, .slide-down, .slide-left, .slide-right, .fade-in'
  );
  
  const revealElement = (entry: IntersectionObserverEntry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  };
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(revealElement);
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );
  
  elements.forEach(element => {
    // Remove any existing animation classes
    element.classList.remove('animate');
    observer.observe(element);
  });
}

/**
 * Initialize all Apple-style UI effects
 * Call this function once when the application loads
 */
export function initAppleEffects() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMagneticButtons();
      initParallax();
      init3DTransform();
      initScrollReveal();
    });
  } else {
    initMagneticButtons();
    initParallax();
    init3DTransform();
    initScrollReveal();
  }
}

/**
 * Add subtle sound feedback to interactive elements
 * Must be called after user interaction due to browser autoplay policies
 */
export function initSoundEffects() {
  // Create audio elements
  const clickSound = new Audio();
  clickSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCkpKSkpPz8/Pz9UVFRUVGpqampqf39/f3+UlJSUlKqqqqqq//////////+qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  clickSound.volume = 0.1;
  
  const hoverSound = new Audio();
  hoverSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCkpKSkpPz8/Pz9UVFRUVGpqampqf39/f3+UlJSUlKqqqqqq//////////+qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAADwAABpAAAACAAADSAAAAEVEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  hoverSound.volume = 0.05;
  
  // Add event listeners to interactive elements
  const clickElements = document.querySelectorAll('button, .apple-button, .btn-magnetic');
  const hoverElements = document.querySelectorAll('.apple-nav-item, .segmented-control-option');
  
  clickElements.forEach(element => {
    element.addEventListener('click', () => {
      clickSound.currentTime = 0;
      clickSound.play().catch(() => {
        // Ignore autoplay errors
      });
    });
  });
  
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      hoverSound.currentTime = 0;
      hoverSound.play().catch(() => {
        // Ignore autoplay errors
      });
    });
  });
}