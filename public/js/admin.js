function strongPassword(password) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

async function createPrivilegedUser() {
  const username = document.getElementById('new-username').value.trim();
  const email = document.getElementById('new-email').value.trim();
  const password = document.getElementById('new-password').value;
  const role = document.getElementById('new-role').value;
  const securityAnswer = document.getElementById('new-answer').value.trim();
  const securityQuestion = 'What is your assigned recovery phrase for this lab account?';
  if (!username || !email || !strongPassword(password) || securityAnswer.length < 6) return showMessage('Please complete all fields and follow the password policy.', 'error');
  const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password, role, securityQuestion, securityAnswer }) });
  const data = await res.json();
  if (data.success) { showMessage('Account created.', 'success'); setTimeout(() => location.reload(), 800); }
  else showMessage(data.message || 'Failed to create account.', 'error');
}

async function changeRole(userId) {
  const role = document.getElementById('role-' + userId).value;
  const res = await fetch('/api/admin/users/role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) });
  const data = await res.json();
  if (data.success) showMessage('Role updated.', 'success');
  else showMessage(data.message || 'Failed to update role.', 'error');
}

async function deletePrivilegedUser(userId) {
  if (!confirm('Delete this privileged account?')) return;
  const res = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
  const data = await res.json();
  if (data.success) { showMessage('Account deleted.', 'success'); setTimeout(() => location.reload(), 800); }
  else showMessage(data.message || 'Failed to delete account.', 'error');
}

async function filterLogs() {
  const eventType = document.getElementById('filter-event').value.trim();
  const status = document.getElementById('filter-status').value;
  const res = await fetch(`/api/admin/logs?eventType=${encodeURIComponent(eventType)}&status=${encodeURIComponent(status)}`);
  const data = await res.json();
  if (!data.success) return showMessage('Could not load logs.', 'error');
  const tbody = document.querySelector('#logs-table tbody');
  tbody.innerHTML = '';
  data.logs.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${new Date(log.createdAt).toLocaleString()}</td><td>${log.eventType}</td><td>${log.status}</td><td>${log.username}</td><td>${log.role}</td><td>${log.path}</td>`;
    tbody.appendChild(row);
  });
}
