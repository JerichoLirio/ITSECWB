function strongPassword(password) {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

async function createPrivilegedUser() {
  const username = document.getElementById('new-username').value.trim();
  const email = document.getElementById('new-email').value.trim();
  const password = document.getElementById('new-password').value;
  const securityQuestion = document.getElementById('new-question').value.trim();
  const securityAnswer = document.getElementById('new-answer').value.trim();
  const role = document.getElementById('new-role').value;
  if (!username || !email || !strongPassword(password) || !securityQuestion || !securityAnswer || securityAnswer.length < 6) return showMessage('Please complete all fields. Security answer must be at least 6 characters.', 'error');
  const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password, role, securityQuestion, securityAnswer }) });
  const data = await res.json();
  if (data.success) { showMessage('Account created.', 'success'); setTimeout(() => location.reload(), 800); }
  else showMessage(data.message || 'Failed to create account.', 'error');
}

function openEditUser(btn) {
  document.getElementById('edit-user-id').value = btn.dataset.id;
  document.getElementById('edit-username').value = btn.dataset.username;
  document.getElementById('edit-email').value = btn.dataset.email;
  document.getElementById('edit-password').value = '';
  document.getElementById('edit-role').value = btn.dataset.role;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).show();
}

async function saveEditUser() {
  const userId = document.getElementById('edit-user-id').value;
  const username = document.getElementById('edit-username').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  const password = document.getElementById('edit-password').value;
  const role = document.getElementById('edit-role').value;

  if (!username || !email) return showMessage('Username and email are required.', 'error');
  if (password && !strongPassword(password)) return showMessage('New password does not meet the password policy.', 'error');

  const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, username, email, password, role }) });
  const data = await res.json();
  if (data.success) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).hide();
    showMessage('Account updated.', 'success');
    setTimeout(() => location.reload(), 800);
  } else {
    showMessage(data.message || 'Failed to update account.', 'error');
  }
}

async function deletePrivilegedUser(userId) {
  if (!confirm('Delete this account?')) return;
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
  if (!username || !email || !strongPassword(password) || !securityAnswer || securityAnswer.length < 6) return showMessage('Please complete all fields. Security answer must be at least 6 characters.', 'error');
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
