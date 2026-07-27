document.addEventListener('DOMContentLoaded', function() {
  const getQuestionBtn = document.getElementById('get-question-btn');
  const form = document.getElementById('forgot-form');

  function strongPassword(password) {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  }

  getQuestionBtn.addEventListener('click', async function() {
    const username = document.getElementById('reset-username').value.trim();
    if (!username) return showMessage('Username is required', 'error');
    const res = await fetch('/api/forgot-password/question', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (data.success) document.getElementById('security-question-text').textContent = data.question;
    else showMessage('Unable to load reset question.', 'error');
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const securityAnswer = document.getElementById('security-answer').value.trim();
    const newPassword = document.getElementById('new-password').value;
    if (!strongPassword(newPassword)) return showMessage('New password does not meet the password policy.', 'error');
    const res = await fetch('/api/forgot-password/reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, securityAnswer, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showMessage('Password reset successful. Please login.', 'success');
      setTimeout(() => { window.location.href = '/login'; }, 1000);
    } else showMessage(data.message || 'Password reset failed', 'error');
  });
});
