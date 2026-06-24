  //Please preserve camelCase convention

  // Login form submission handler
  document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = document.getElementById('remember').checked;
        
        // Front-end validation
        if (!username) {
          showMessage('Username is required', 'error');
          return;
        }

        if (!password) {
          showMessage('Password is required', 'error');
          return;
        }


        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              password: password,
              remember: remember
            })
          });
          const data = await response.json();
          
          if (data.success) {
            showMessage('Login successful! Welcome, ' + data.user.username, 'success');
            setTimeout(() => {
              window.location.href = '/home';
            }, 1000);
          } else {
            showMessage('Login failed: ' + data.message, 'error');
          }
        } catch (error) {
          console.error('Error:', error);
          showMessage('An error occurred during login', 'error');
        }
      });
    }
  });