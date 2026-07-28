// Global variables for seat display details and manipulation
let selectedDate = null;
let readableDate = null;
let selectedTime = null;
let selectedLab = null;
let currentSeatId = null;
let currentReservationId = null;

/**
 * Not sure why but flatpickr should be the top function else the calendar won't show up
 * dateFormat: "m-d-Y" sets the date format to month-day-year
 * minDate: "today" makes sure the current date is the earliest date that can be selected
 * maxDate: new Date().fp_incr(7) sets the latest date to 7 days from today
 * defaultDate: "today" initializes the calendar with today's date selected
 */
const defaultDate = new Date();
const isTodaySunday = defaultDate.getDay() === 0;
if (isTodaySunday) defaultDate.setDate(defaultDate.getDate() + 1);
  const fp = flatpickr("#calendar", {
    dateFormat: "m-d-Y",
    inline: true,
    minDate: isTodaySunday ? new Date(new Date().setDate(new Date().getDate() + 1)) : "today",
    maxDate: new Date().fp_incr(7),
    defaultDate: defaultDate,
    disable: [
      function(date) {
        return date.getDay() === 0; // Disable Sundays
      }
    ],
    onChange: function(selectedDates) {
      selectedDate = this.formatDate(selectedDates[0], "Y-m-d");
      readableDate = this.formatDate(selectedDates[0], "F j, Y");
      updateSeatAvailability();
    }
  });
  
  // Initialize with default values
  selectedDate = fp.formatDate(fp.selectedDates[0], "Y-m-d");
  readableDate = fp.formatDate(fp.selectedDates[0], "F j, Y");

/**
 * Fetches reservations and updates seat availability display given a:
 * specific Date, Time, Lab
 */
async function updateSeatAvailability() {
  if (!selectedLab || !selectedDate || !selectedTime) return;

  const [startTime] = selectedTime.split('-');

  try {
    // 
    const response = await fetch(`/api/reservations?lab=${selectedLab}&date=${selectedDate}&startTime=${startTime.trim()}`);  // At this SPECIFIC lab, date, and time,
    const data = await response.json();    // Call the controller method getByLabDateTime, returns a json of all occupied seats with fields .seat and .username

    // Reset all seats in the current display first
    document.querySelectorAll('.btn.seat').forEach(btn => {
      btn.classList.remove('occupied');
      btn.removeAttribute('data-user');
      btn.removeAttribute('data-user-id');
      btn.removeAttribute('data-walkin');
      btn.removeAttribute('data-reservation-id');
    });

    // Mark the occupied seats nased on the data res
    if (data.success) {
      data.occupiedSeats.forEach(({ seat, username, userId, isWalkIn, reservationId }) => {
        const btn = document.getElementById(seat);
        if (btn) {
          btn.classList.add('occupied');
          btn.setAttribute('data-user', username); // Data user is just a hidden property in html, will be used to display the username in modals
          btn.setAttribute('data-user-id', userId); // Used to check if the user id of the one who reserved it, is the same as the user id of the CURRENT SESSION user in modals
          btn.setAttribute('data-reservation-id', reservationId);
          if (isWalkIn) btn.setAttribute('data-walkin', 'true');
        }
      });
    }
  } catch (err) {
    console.error('Error fetching seat availability:', err);
  }
}

function checkLabBlocked() {
  if (typeof labStatuses !== 'undefined' && labStatuses[selectedLab]) {
    showMessage(`${selectedLab} is currently unavailable for reservations.`, 'error');
    document.querySelectorAll('.btn.seat').forEach(btn => btn.disabled = true);
  } else {
    document.querySelectorAll('.btn.seat').forEach(btn => btn.disabled = false);
  }
}

/**
 * Updates selected time when user picks a different time interval
 */
function setupTimeSelector() {
  const timeDropdown = document.querySelector('#timeInterval');
  if (timeDropdown) {
    selectedTime = timeDropdown.value;
    timeDropdown.addEventListener('change', (e) => {
      selectedTime = e.target.value;
      updateSeatAvailability();
    });
  }
}

/**
 * Updates selected lab when user picks a different labm as well as
 * initializing the default value of the drop down to the selected one in homepage
 */
function setupLabSelector() {
  const labDropdown = document.querySelector('#labDropdown');

  if (defaultLab) labDropdown.value = defaultLab;
  if (!labDropdown.value) labDropdown.value = 'G404A';

  selectedLab = labDropdown.value;
  labDropdown.addEventListener('change', (e) => {
    selectedLab = e.target.value;
    updateSeatAvailability();
  });
}

/**
 * Handles seat click behavior and shows appropriate modal
 */
function handleSeatClick(btn) {
  const seatId = btn.id;
  currentSeatId = seatId;
  currentReservationId = btn.getAttribute('data-reservation-id') || null;
  const isWalkIn = btn.getAttribute('data-walkin') === 'true';

  // Different modals are shown depending on whether seat is occupied or not (shows either reserve func. or other user)
  // Update all seat details in titles in every modal

  document.querySelectorAll('.empty-seat-title')
    .forEach(modal => modal.textContent = `Seat ${seatId}`);
  
  document.querySelectorAll('.seat-details')
    .forEach(modal => modal.innerHTML = `${readableDate}<br>${selectedTime}<br>${selectedLab}`);
  
  // For seats that are empty:
  if (!btn.classList.contains('occupied')) {
    if ((currentUserRole === 'lab_manager' || currentUserRole === 'admin')) {
      new bootstrap.Modal(document.getElementById('walkInModal')).show();
    } else {
      new bootstrap.Modal(document.getElementById('emptySeatModal')).show();
    }
  } else { // Seats that are occupied
    const seatUserId = btn.getAttribute('data-user-id');
    const username = btn.getAttribute('data-user') || 'Anonymous';
 
    document.querySelectorAll('.occupied-seat-title')
      .forEach(el => el.textContent = `Seat ${seatId} is occupied`);
      
    document.querySelectorAll('.otherUserLink').forEach(link => {
      link.textContent = username;
      if (isWalkIn || username === 'Anonymous') { // If the user is anonymous or a walkin
        link.removeAttribute('href'); // Dont add a link
        // link.style.color = 'inherit';
      } else {
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent - URI Decoder
        // To do: Maybe replace lab routing with this instead of purely just /G404
        link.href = `/profile/${encodeURIComponent(username)}`;
      }
    });
 
    if ((currentUserRole === 'lab_manager' || currentUserRole === 'admin')) {
      prefillEditForm('Tech');
      new bootstrap.Modal(document.getElementById('editModal')).show();
    } else if (seatUserId === currentUserId) { // If the selected seat was made by the current user
      prefillEditForm('User');
      new bootstrap.Modal(document.getElementById('editUserModal')).show();
    } else {  // Viewing the occupied seat of a different user
      new bootstrap.Modal(document.getElementById('occupiedSeatModal')).show();
    }
  }
}

/**
 * Pre-fills the Edit modal's lab/date/time fields with the reservation's current values
 */
function prefillEditForm(which) {
  const labField = document.getElementById(`editLab${which}`);
  const dateField = document.getElementById(`editDate${which}`);
  const timeField = document.getElementById(`editTime${which}`);
  if (labField) labField.value = selectedLab;
  if (dateField) dateField.value = selectedDate;
  if (timeField) timeField.value = selectedTime;
}

/**
 * Restricts the Edit modal's date inputs to the same 7-day booking window as the calendar
 */
function setupEditDateLimits() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const maxIso = new Date().fp_incr(7).toISOString().slice(0, 10);
  ['editDateUser', 'editDateTech'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.min = todayIso;
      field.max = maxIso;
    }
  });
}

/**
 * Move an existing reservation to a different lab, date, or time
 */
async function updateReservation(which) {
  if (!currentReservationId) return;

  const lab = document.getElementById(`editLab${which}`).value;
  const date = document.getElementById(`editDate${which}`).value;
  const time = document.getElementById(`editTime${which}`).value;
  const [startTime, endTime] = time.split('-');

  try {
    const response = await fetch(`/api/reservations/${currentReservationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lab,
        seat: currentSeatId,
        date,
        startTime: startTime.trim(),
        endTime: endTime.trim()
      })
    });

    const data = await response.json();

    if (data.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')) ||
                    bootstrap.Modal.getInstance(document.getElementById('editModal'));
      if (modal) modal.hide();
      showMessage('Reservation updated successfully!', 'success');
      currentSeatId = null;
      currentReservationId = null;
      updateSeatAvailability();
    } else {
      showMessage('Failed to update reservation: ' + data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('An error occurred while updating the reservation', 'error');
  }
}

/**
 * Reserve a seat
 */
async function reserveSeat() {
  if (!currentSeatId) return;

  const isAnonymous = document.querySelector('#anonymousCheck').checked;
  const [startTime, endTime] = selectedTime.split('-');

  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lab: selectedLab,
        seat: currentSeatId,
        date: selectedDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        anonymous: isAnonymous
      })
    });

    const data = await response.json();

    if (data.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('emptySeatModal'));
      if (modal) modal.hide();
      showMessage('Seat reserved successfully!', 'success');
      currentSeatId = null;
      updateSeatAvailability();
    } else {
      showMessage('Reservation failed: ' + data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('An error occurred while reserving the seat', 'error');
  }
}

/**
 * Remove a reservation
 */
async function removeReservation() {
  if (!currentSeatId) return;

  const [startTime] = selectedTime.split('-');

  try {
    const response = await fetch('/api/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lab: selectedLab,
        seat: currentSeatId,
        date: selectedDate,
        startTime: startTime.trim()
      })
    });

    const data = await response.json();

    if (data.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')) ||
                    bootstrap.Modal.getInstance(document.getElementById('editModal'));
      if (modal) modal.hide();
      showMessage('Reservation removed successfully!', 'success');
      currentSeatId = null;
      currentReservationId = null;
      updateSeatAvailability();
    } else {
      showMessage('Failed to remove reservation: ' + data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('An error occurred while removing the reservation', 'error');
  }
}

/**
 * Reserve a seat as a walk-in (lab_manager only)
 */
async function reserveSeatWalkIn() {
  if (!currentSeatId) return;

  const walkInName = document.querySelector('#walkInName').value.trim();
  if (!walkInName) {
    showMessage('Please enter a name', 'error');
    return;
  }

  const [startTime, endTime] = selectedTime.split('-');

  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lab: selectedLab,
        seat: currentSeatId,
        date: selectedDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        anonymous: false,
        walkInName: walkInName
      })
    });

    const data = await response.json();

    if (data.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('walkInModal'));
      if (modal) modal.hide();
      showMessage('Walk-in reservation created!', 'success');
      currentSeatId = null;
      updateSeatAvailability();
    } else {
      showMessage('Reservation failed: ' + data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showMessage('An error occurred while reserving the seat', 'error');
  }
}

/**
 * Attach event listeners to all seat buttons
 */
function setupSeatListeners() {
  document.querySelectorAll('.btn.seat').forEach(btn => {
    btn.addEventListener('click', () => handleSeatClick(btn));
  });
}

// Setup everything
document.addEventListener('DOMContentLoaded', function() {
  setupTimeSelector();
  setupLabSelector();
  setupSeatListeners();
  setupEditDateLimits();
  updateSeatAvailability();
  setInterval(updateSeatAvailability, 5 * 60 * 1000); // Refresh every 5 minutes
});