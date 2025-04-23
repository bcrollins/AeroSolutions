/**
 * Main JavaScript for AI Platform API Landing Page
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Add scroll event listener for navbar
  const header = document.querySelector('header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Add click event listeners for documentation tabs
  const docLinks = document.querySelectorAll('.doc-sidebar a');
  
  docLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      docLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Get the target section
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      // Hide all sections
      const allSections = document.querySelectorAll('.doc-section');
      allSections.forEach(section => section.style.display = 'none');
      
      // Show target section
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });
  
  // Toggle endpoint details
  window.toggleEndpointDetails = function(detailsId) {
    const detailsElement = document.getElementById(detailsId);
    
    if (detailsElement) {
      detailsElement.classList.toggle('hidden');
      
      // Change button text
      const button = detailsElement.previousElementSibling;
      
      if (button && button.tagName === 'BUTTON') {
        if (detailsElement.classList.contains('hidden')) {
          button.textContent = 'View Details';
        } else {
          button.textContent = 'Hide Details';
        }
      }
    }
  };
  
  // Add smooth scrolling to all anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // Skip if it's a documentation tab or doesn't have a valid target
      if (targetId === '#' || this.closest('.doc-sidebar')) {
        return;
      }
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add copy button functionality for code blocks
  const codeBlocks = document.querySelectorAll('.code-block');
  
  codeBlocks.forEach(block => {
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    
    // Add button to code block
    block.appendChild(copyButton);
    
    // Add click event to copy code
    copyButton.addEventListener('click', function() {
      const codeText = block.querySelector('code').textContent;
      
      // Copy to clipboard
      navigator.clipboard.writeText(codeText).then(function() {
        // Change button text temporarily
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');
        
        // Reset button text after delay
        setTimeout(function() {
          copyButton.textContent = 'Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      }).catch(function(err) {
        console.error('Failed to copy: ', err);
        copyButton.textContent = 'Error';
      });
    });
  });
  
  // Simple form validation for contact form (if exists)
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Perform validation
      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      const messageInput = contactForm.querySelector('textarea[name="message"]');
      
      let isValid = true;
      
      // Simple required fields validation
      [nameInput, emailInput, messageInput].forEach(input => {
        if (input && !input.value.trim()) {
          input.classList.add('error');
          isValid = false;
        } else if (input) {
          input.classList.remove('error');
        }
      });
      
      // Simple email validation
      if (emailInput && emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
        emailInput.classList.add('error');
        isValid = false;
      }
      
      // If valid, submit form
      if (isValid && contactForm.action) {
        // In a real application, you would submit the form
        // For this demo, just show a success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your message! We will contact you soon.';
        
        contactForm.innerHTML = '';
        contactForm.appendChild(successMessage);
      }
    });
  }
  
  // Helper function for email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});