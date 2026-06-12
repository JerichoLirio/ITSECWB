
// Registration form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const confirmPassword = document.getElementById('confirm-password').value.trim();

      // Front-end validation
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
 
      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }

      try {
        // Send registration request to server
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
          })
        });
        const data = await response.json();
        
        if (data.success) {
          showMessage('Registration successful! You can now login with your new account.', 'success');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          showMessage('Registration failed: ' + data.message, 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred during registration', 'error');
      }
    });
  }
});