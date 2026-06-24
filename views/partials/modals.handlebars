<!-- Modal for empty seat (user view) -->
{{#unless (eq role 'technician')}}
<div class="modal fade" id="emptySeatModal" tabindex="-1" aria-labelledby="emptySeatTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title empty-seat-title">Seat Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex justify-content-between">

        <!-- Left side seat details -->
        <div class="seat-details">
          <p>Seat Number: {{emptySeat.seatNumber}}</p>
          <p>Date: {{emptySeat.date}}</p>
          <p>Time: {{emptySeat.time}}</p>
        </div>

        <!-- Right side reserve button -->
        <div class="d-flex flex-column align-items-center">
          <div class="form-check mb-2 align-items-center d-flex">
            <input class="form-check-input" type="checkbox" id="anonymousCheck" {{#if emptySeat.isAnonymous}}checked{{/if}}>
            <label class="form-check-label ms-3" for="anonymousCheck">Reserve Anonymously</label>
          </div>
          <button class="btn modal-btn bg-black text-white" id="reserveBtn" onclick="reserveSeat('{{emptySeat.seatNumber}}')">Reserve</button>
        </div>

      </div>
    </div>
  </div>
</div>
{{/unless}}

{{#unless (eq role 'technician')}}
<!-- Modal for occupied seat (user view) -->
<div class="modal fade" id="occupiedSeatModal" tabindex="-1" aria-labelledby="occupiedSeatTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title occupied-seat-title">Seat Occupied</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex justify-content-center align-items-center gap-3">
        <img class="modal-user-icon" src="/images/person-circle.svg">
        <a href="{{occupiedSeat.profileLink}}" target="_self" class="user-link otherUserLink">{{occupiedSeat.username}}</a>
      </div>
    </div>
  </div>
</div>
{{/unless}}

{{#unless (eq role 'technician')}}
<!-- Modal for editing a seat (USER) -->
<div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title occupied-seat-title">Edit</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex justify-content-center align-items-center gap-3">
        <img class="modal-user-icon" src="/images/person-circle.svg">
        <a href="{{editUser.profileLink}}" target="_self" class="user-link otherUserLink">{{editUser.username}}</a>
      </div>
      <div class="modal-footer d-flex justify-content-center">
        <button class="btn modal-btn bg-danger text-white" id="removeBtn" onclick="removeReservation('{{editUser.reservationId}}')">Remove</button>
      </div>
    </div>
  </div>
</div>
{{/unless}}

{{#if (eq role 'technician')}}
<!-- Modal for editing a seat (LAB TECHNICIAN) -->
<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title occupied-seat-title">Edit</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex justify-content-center align-items-center gap-3">
        <img class="modal-user-icon" src="/images/person-circle.svg">
        <a href="{{editTech.profileLink}}" target="_self" class="user-link otherUserLink">{{editTech.username}}</a>
      </div>
      <div class="modal-footer d-flex justify-content-center">
        {{!-- <button class="btn modal-btn bg-primary text-white" id="editBtn" onclick="editReservation('{{editTech.reservationId}}')">Edit</button> --}}
        <button class="btn modal-btn bg-danger text-white" id="removeBtn" onclick="removeReservation('{{editTech.reservationId}}')">Remove</button>
      </div>
    </div>
  </div>
</div>
{{/if}}

{{#if (eq role 'technician')}}
<!-- Modal for walk-in reservation (LAB TECHNICIAN) -->
<div class="modal fade" id="walkInModal" tabindex="-1" aria-labelledby="emptySeatTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title empty-seat-title">Seat Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex justify-content-between">
        <div class="seat-details">
          <p>Seat Number: {{walkIn.seatNumber}}</p>
          <p>Date: {{walkIn.date}}</p>
          <p>Time: {{walkIn.time}}</p>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="text" class="form-control mb-3" id="walkInName" placeholder="Enter name" value="{{walkIn.name}}">
          <button class="btn modal-btn bg-black text-white" id="reserveBtnTech" onclick="reserveSeatWalkIn('{{walkIn.seatNumber}}')">Reserve</button>
        </div>
      </div>
    </div>
  </div>
</div>
{{/if}}

<!-- Modal for user profile (top right corner) -->
<div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Profile</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body d-flex justify-content-center align-items-center gap-3">
        <img id="profile-modal-icon" class="modal-user-icon" src="/images/person-circle.svg">
        <a href="/account-profile" target="_self" class="user-link" id="userLink">{{username}}</a>
      </div>
      <div class="modal-footer d-flex justify-content-center">
        <a onclick="logout()" class="btn modal-btn bg-danger text-white" id="logoutBtn">Logout</a>
      </div>
    </div>
  </div>
</div>

{{#if (eq role 'admin')}}
<!-- Modal for create technician -->
<div class="modal fade" id="createTechnicianModal" tabindex="-1" data-bs-backdrop="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Create Technician Account</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input type="text" class="form-control" id="tech-username">
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" id="tech-email">
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" id="tech-password">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="createTechnician()">Create</button>
      </div>
    </div>
  </div>
</div>
{{/if}}
