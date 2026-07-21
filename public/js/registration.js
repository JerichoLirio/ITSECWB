document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');
  const passwordRule = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

  function strongPassword(password) {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const securityQuestion = document.getElementById('security-question').value.trim();
      const securityAnswer = document.getElementById('security-answer').value.trim();

      if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) return showMessage('Username must be 3-30 letters, numbers, or underscores only.', 'error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage('Please enter a valid email address.', 'error');
      if (!strongPassword(password)) return showMessage(passwordRule, 'error');
      if (password !== confirmPassword) return showMessage('Passwords do not match', 'error');
      if (securityQuestion.length < 10 || securityAnswer.length < 6) return showMessage('Use a more specific security question and answer.', 'error');

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, confirmPassword, securityQuestion, securityAnswer })
        });
        const data = await response.json();
        if (data.success) {
          showMessage('Registration successful! You can now login.', 'success');
          setTimeout(() => { window.location.href = '/login'; }, 1000);
        } else {
          showMessage(data.message || 'Registration failed', 'error');
        }
      } catch (error) {
        showMessage('An error occurred during registration', 'error');
      }
    });
  }
});
