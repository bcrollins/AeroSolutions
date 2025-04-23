/**
 * Main JavaScript for the landing page
 */
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for header
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to the current menu item
  window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelector('.nav-links a[href*=' + sectionId + ']')?.classList.add('active');
      } else {
        document.querySelector('.nav-links a[href*=' + sectionId + ']')?.classList.remove('active');
      }
    });
  });
  
  // Feature cards animation
  const featureCards = document.querySelectorAll('.feature-card');
  
  if (featureCards.length > 0) {
    featureCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, 100 * index);
    });
  }
  
  // Code blocks syntax highlighting simulation
  const codeBlocks = document.querySelectorAll('.code-block pre code');
  
  if (codeBlocks.length > 0) {
    codeBlocks.forEach(block => {
      // Simple syntax highlighting
      let content = block.innerHTML;
      
      // Highlight strings
      content = content.replace(/"(.*?)"/g, '<span class="string">"$1"</span>');
      
      // Highlight numbers
      content = content.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
      
      // Highlight keys in JSON
      content = content.replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:');
      
      // Set the modified content
      block.innerHTML = content;
    });
  }
  
  // Simple form validation for contact form (if added later)
  const contactForm = document.querySelector('#contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Add form validation logic here
      
      // Show success message
      alert('Your message has been sent successfully!');
      contactForm.reset();
    });
  }
  
  // Add CSS for dynamic elements
  const style = document.createElement('style');
  style.textContent = `
    .feature-card {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .feature-card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .nav-links a.active {
      color: var(--primary-color);
      font-weight: 700;
    }
    
    .code-block .string {
      color: #a6e22e;
    }
    
    .code-block .number {
      color: #ae81ff;
    }
    
    .code-block .key {
      color: #f92672;
    }
  `;
  
  document.head.appendChild(style);
  
  // Console message for developers
  console.log('✨ AI Platform API | Ready for integration');
});