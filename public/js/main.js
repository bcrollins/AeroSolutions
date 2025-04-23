/**
 * Main JavaScript file for the application
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialized');
  
  // Handle mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      navToggle.classList.toggle('active');
    });
  }
  
  // Handle form submissions with AJAX if needed
  const forms = document.querySelectorAll('form[data-ajax="true"]');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const formObject = {};
      
      formData.forEach((value, key) => {
        formObject[key] = value;
      });
      
      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formObject)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // Handle success
          const successCallback = form.dataset.successCallback;
          if (successCallback && window[successCallback]) {
            window[successCallback](result);
          } else {
            alert('Form submitted successfully');
          }
        } else {
          // Handle error
          const errorCallback = form.dataset.errorCallback;
          if (errorCallback && window[errorCallback]) {
            window[errorCallback](result);
          } else {
            alert(`Error: ${result.message || 'Something went wrong'}`);
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred while submitting the form. Please try again.');
      }
    });
  });
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});