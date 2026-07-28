async function showBlockPrompt(labName) {
  const reason = prompt(`Reason for blocking ${labName} (optional, max 200 chars):`);
  if (reason === null) return; // user cancelled
  await blockLab(labName, reason.trim().slice(0, 200));
}

async function blockLab(labName, reason) {
  try {
    const res = await fetch('/api/labs/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lab: labName, reason })
    });
    const data = await res.json();
    if (data.success) { showMessage(`${labName} blocked.`, 'success'); setTimeout(() => location.reload(), 600); }
    else showMessage(data.message || 'Failed to block lab.', 'error');
  } catch (err) {
    showMessage('An error occurred while blocking the lab.', 'error');
  }
}

async function unblockLab(labName) {
  try {
    const res = await fetch('/api/labs/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lab: labName })
    });
    const data = await res.json();
    if (data.success) { showMessage(`${labName} unblocked.`, 'success'); setTimeout(() => location.reload(), 600); }
    else showMessage(data.message || 'Failed to unblock lab.', 'error');
  } catch (err) {
    showMessage('An error occurred while unblocking the lab.', 'error');
  }
}