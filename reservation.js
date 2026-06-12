
const MIN_PASSWORD_LENGTH = 3

// Show message to user
/**
 * .queryselector() method to find elements in which case the css of .login-message
 * .createelement() creates a new element in MEMORY 
 * .appenedchild() adds the element in the document
 * settimeout executs a function after delay
 */
function showMessage(message, type) {
  // Remove any existing messages
  const existingMessage = document.querySelector('.login-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `login-message`;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 12px 24px;
    border-radius: 8px;
    color: ${type === 'error' ? '#721c24' : '#155724'};
    background-color: ${type === 'error' ? '#f8d7da' : '#d4edda'};
    border: 1px solid ${type === 'error' ? '#f5c6cb' : '#c3e6cb'};
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add CSS animation
  if (!document.getElementById('message-animations')) {
    const style = document.createElement('style');
    style.id = 'message-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translate(-50%, 0);
          opacity: 1;
        }
        to {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Navigation helpers
function navigateToLogin() {
  window.location.href = '/login';
}

function navigateToRegister() {
  window.location.href = '/register';
}

function navigateToHome() {
  window.location.href = '/';
}

function navigateToProfile() {
  window.location.href = '/account-profile';
}

function navigateToReservation() {
  window.location.href = '/reservation';
}

async function logout() {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/login';
  }
}


async function createTechnician() {
  const username = document.getElementById('tech-username').value.trim();
  const email = document.getElementById('tech-email').value.trim();
  const password = document.getElementById('tech-password').value.trim();

  if (!username) {
    showMessage('Username is required', 'error');
    return;
  }

  if (!email) {
    showMessage('Email is required', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }

  if (!password) {
    showMessage('Password is required', 'error');
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    showMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 'error');
    return;
  }

  try {
    const response = await fetch('/api/create-technician', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (data.success) {
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('createTechnicianModal'));
      modal.hide();
      showMessage('Technician account created successfully!', 'success');
    } else {
      showMessage('Failed: ' + data.message, 'error');
    }
  } catch (err) {
    showMessage('An error occurred', 'error');
  }
}