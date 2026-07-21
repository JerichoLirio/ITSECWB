# Lab Reservation System - Secure Web Development Version

This project is the updated CCAPDEV lab reservation system prepared for the Secure Web Development machine project.

## Main Role Mapping

| Checklist Role | Project Role |
| --- | --- |
| Website Administrator | Administrator |
| Product Manager / Role A | Lab Manager |
| Customer / Role B | Student |

The application is still a computer lab reservation system. The Product Manager role was renamed to Lab Manager because it better fits the project.

## How to Run

1. Make sure MongoDB is running locally.
2. Install dependencies:

```bash
npm install
```

3. Seed the database:

```bash
node init_db.js
```

4. Start the server:

```bash
npm start
```

5. Open the app in your browser:

```text
http://localhost:3000
```

## Demo Accounts

| Role | Username | Password |
| --- | --- | --- |
| Administrator | admin | Admin123! |
| Lab Manager | labmanager | Manager123! |
| Student | student | Student123! |

## Security Features Added

- Three user roles: Administrator, Lab Manager, and Student
- Protected pages and APIs using shared authorization middleware
- Passwords stored using bcrypt salted one-way hashes
- Generic login failure message
- Password complexity and length rules
- Account lockout after 5 failed login attempts
- Last account use message shown after login
- Password reset using a custom security question and answer
- Password reuse prevention
- One-day minimum password age before password change
- Re-authentication before password change
- Input validation with rejection of invalid values
- Generic error handling and custom error page
- Audit logging for login, logout, validation failures, access-control failures, password changes, account changes, and reservation actions
- Admin-only dashboard for managing privileged accounts and viewing/filtering logs
- Lab Manager dashboard for viewing and managing reservations

## Important Notes

- Run `node init_db.js` before demoing so the required demo accounts are created.
- The app uses MongoDB at `mongodb://127.0.0.1:27017/userdb` by default.
- Static CSS, images, and client-side JavaScript are intentionally public because they are needed for the login and registration pages to display correctly.

- Demo reservations are seeded for the next valid reservation date so they remain testable during the demo.
