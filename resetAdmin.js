<!-- Top navigation bar -->
<nav class="d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow">
                            
    <!-- Logo and LRS Label -->
    <div class="d-flex align-items-center gap-3">
        <img class="logo-img" src="/images/dlsu_logo.png" alt="Logo" style="height:45px;">
        <h5 class="mb-0 fw-semibold logo-label">Lab Reservation System</h5>
    </div>

    <!-- Breadcrumb (dynamic but only in reservation and profile -->
    {{#if breadcrumbs}}
    <div>
        <ol class="breadcrumb mb-0">
            {{#each breadcrumbs}}
            {{#if this.active}}
                <li class="breadcrumb-item active fw-semibold text-dark">{{this.label}}</li>
            {{else}}
                <li class="breadcrumb-item">
                    <a href="{{this.url}}" class="text-decoration-none text-secondary">{{this.label}}</a>
                </li>
            {{/if}}
            {{/each}}
        </ol>
    </div>
    {{/if}}

    <!-- User button (account in the top right) -->
    <button id="userBtn" class="btn" data-bs-toggle="modal" data-bs-target="#userModal">
        <img id="userIcon" src="/images/person-circle.svg" style="width:30px;">              
    </button>

</nav>
