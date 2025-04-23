/**
 * Main JavaScript for the API Platform Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Contact form handling
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
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
          displayMessage('Thank you for your message. We will contact you soon!', 'success');
          contactForm.reset();
        } else {
          displayMessage(`Failed to send message: ${result.error?.message || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        displayMessage(`An error occurred: ${error.message}`, 'error');
      }
    });
  }

  // API Test buttons
  const openaiTestBtn = document.querySelector('a[href="/api/openai/test"]');
  const dbTestBtn = document.querySelector('a[href="/api/database/test"]');
  
  if (openaiTestBtn) {
    openaiTestBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await testEndpoint('/api/openai/test', 'OpenAI API');
    });
  }
  
  if (dbTestBtn) {
    dbTestBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await testEndpoint('/api/database/test', 'Database');
    });
  }

  // Helper for testing endpoints
  async function testEndpoint(url, name) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        displayMessage(`${name} connection successful!`, 'success');
      } else {
        displayMessage(`${name} connection failed: ${data.error?.message || 'Unknown error'}`, 'error');
      }
      
      // Log detailed response to console
      console.log(`${name} test response:`, data);
    } catch (error) {
      displayMessage(`Error testing ${name}: ${error.message}`, 'error');
    }
  }

  // Message display helper
  function displayMessage(message, type) {
    // Check if a message container already exists
    let messageContainer = document.getElementById('message-container');
    
    // If not, create one
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.id = 'message-container';
      messageContainer.style.position = 'fixed';
      messageContainer.style.top = '20px';
      messageContainer.style.right = '20px';
      messageContainer.style.zIndex = '1000';
      document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.style.padding = '15px 20px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '6px';
    messageElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    messageElement.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    messageElement.style.color = 'white';
    messageElement.style.fontWeight = '500';
    messageElement.style.minWidth = '280px';
    messageElement.style.maxWidth = '400px';
    messageElement.style.animation = 'slide-in 0.3s ease-out';
    
    messageElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>${message}</span>
        <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; margin-left: 10px;">×</button>
      </div>
    `;
    
    // Add close button functionality
    messageElement.querySelector('button').addEventListener('click', () => {
      messageElement.style.animation = 'slide-out 0.3s ease-out forwards';
      setTimeout(() => {
        messageContainer.removeChild(messageElement);
      }, 300);
    });
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode === messageContainer) {
        messageElement.style.animation = 'slide-out 0.3s ease-out forwards';
        setTimeout(() => {
          if (messageElement.parentNode === messageContainer) {
            messageContainer.removeChild(messageElement);
          }
        }, 300);
      }
    }, 5000);
  }

  // Add CSS animations for messages
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});