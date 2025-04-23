/**
 * Main JavaScript file for interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuButton && navLinks) {
    mobileMenuButton.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Handle API test buttons
  const testOpenAiButton = document.querySelector('.cta-buttons a[href="/api/openai/test"]');
  const testDatabaseButton = document.querySelector('.cta-buttons a[href="/api/database/test"]');
  
  if (testOpenAiButton) {
    testOpenAiButton.addEventListener('click', async function(e) {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/openai/test');
        const result = await response.json();
        
        if (result.success) {
          alert('OpenAI connection successful!');
        } else {
          alert('OpenAI connection failed: ' + (result.error?.message || 'Unknown error'));
        }
      } catch (error) {
        alert('Error testing OpenAI connection: ' + error.message);
      }
    });
  }
  
  if (testDatabaseButton) {
    testDatabaseButton.addEventListener('click', async function(e) {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/database/test');
        const result = await response.json();
        
        if (result.success) {
          alert('Database connection successful!');
        } else {
          alert('Database connection failed: ' + (result.error?.message || 'Unknown error'));
        }
      } catch (error) {
        alert('Error testing database connection: ' + error.message);
      }
    });
  }
  
  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };
      
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Thank you for your message. We will contact you soon!');
          contactForm.reset();
        } else {
          alert('Failed to send message: ' + (result.error?.message || 'Unknown error'));
        }
      } catch (error) {
        alert('An error occurred: ' + error.message);
      }
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Feature cards animation on scroll
  const featureCards = document.querySelectorAll('.feature-card');
  
  if (featureCards.length > 0) {
    const animateOnScroll = function() {
      featureCards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (cardTop < windowHeight * 0.9) {
          card.style.opacity = 1;
          card.style.transform = 'translateY(0)';
        }
      });
    };
    
    // Initial styles for animation
    featureCards.forEach(card => {
      card.style.opacity = 0;
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    
    // Initial check
    animateOnScroll();
  }
});