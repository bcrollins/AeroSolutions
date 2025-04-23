/**
 * Main JavaScript for the API Platform
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

  // API endpoint tests
  const testOpenAIButton = document.querySelector('a[href="/api/openai/test"]');
  const testDatabaseButton = document.querySelector('a[href="/api/database/test"]');

  if (testOpenAIButton) {
    testOpenAIButton.addEventListener('click', async function(e) {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/openai/test');
        const result = await response.json();
        
        if (result.success) {
          alert('OpenAI API connection successful!');
        } else {
          alert('OpenAI API connection failed: ' + (result.error?.message || 'Unknown error'));
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

  // Smooth scrolling for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Feature card animation
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});