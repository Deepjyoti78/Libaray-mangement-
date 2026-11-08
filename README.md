# The Library — Booking & Check-in System (New Delhi)
> **Independent Student Prototype Concept**
> *Not an official service of The Japan Foundation, New Delhi. Uses fictional demo data for prototype evaluation.*

---

## 1. Overview

This project is a full-stack slot-booking and visitor check-in system designed for an independent student concept of **The Library** at the Japan Foundation in New Delhi. It expands upon the warm Japanese editorial landing page with:

1. **Visitor Booking Wizard (`/book`)**: A 5-step responsive wizard allowing visitors to select a facility (*Reading Room* or *Manga Corner*), date (respecting `Asia/Kolkata` timezone, opening days, and holiday closures), and session timing (*Morning* 11:00–14:30 or *Afternoon* 15:00–18:30) with real-time capacity and strict daily slot limits.
2. **Booking Confirmation Pass (`/booking/confirmation/:id`)**: An editorial museum-pass ticket featuring an un-guessable booking reference, visit metadata, and an **opaque QR code** that contains zero personal identifiable information (PII).
3. **Self-Service Reservation Retrieval & Cancellation (`/my-booking`)**: Secure lookup requiring matching booking reference and email, with real-time seat release.
4. **Staff Operations Portal (`/admin`)**:
   - Secure staff authentication (`/admin/login`) with bcrypt password hashing and HTTP-only session cookies.
   - Operations dashboard (`/admin`) with real-time KPI metrics and capacity bars.
   - Searchable, filterable reservations management table (`/admin/bookings`).
   - Dual-mode check-in station (`/admin/check-in`) supporting live camera QR scanning (`html5-qrcode`) and manual reference lookup with duplicate-arrival rejection.
   - Administrative configuration (`/admin/settings`) for capacities, opening days, exceptional closure dates, and audit trail logs.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 19, Vite, React Router v7, Lucide Icons, Vanilla CSS design tokens adhering to Japanese editorial aesthetics (`#F2EDE3` paper, `#352319` espresso, `#AC512E` terracotta).
- **Backend**: Node.js, Express 5, Zod schema validation, JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`), QR Code generation (`qrcode`), Nodemailer with development fallback.
- **Database**:
  - Embedded Persistent PostgreSQL engine (`@electric-sql/pglite`) storing to local `./data/postgres`.
  - Supports standard external PostgreSQL via `DATABASE_URL` (using `pg.Pool`).
  - ACID transactions use dedicated row locks for both visitor/day limits and facility/session/day capacity, including when a slot has no bookings yet.

---

## 3. Database Schema

- `facilities`: Available spaces (`reading-room`, `manga-corner`) and operational policies.
- `sessions`: Morning (11:00–14:30) and Afternoon (15:00–18:30) slots.
- `facility_session_capacities`: Configured capacities per space and session (fictional demo values).
- `staff_users`: Administrative accounts with securely hashed passwords and roles.
- `bookings`: Reservations with unguessable `JF-2026-XXXXX` public references, SHA-256 hashed check-in tokens, visitor details, status lifecycle (`confirmed`, `checked_in`, `completed`, `cancelled`, `no_show`), and timestamps.
- `closure_dates`: Exceptional holidays and maintenance overrides.
- `settings`: Operational policies (daily limits, advance booking window, cancellation cutoffs).
- `audit_events`: Audit log of staff and system actions.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 22.12+ (tested on Node.js v24.2.0)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the provided `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
- `PORT=3005` (Backend server port)
- `FRONTEND_ORIGIN=http://localhost:5174` (Frontend CORS origin)
- `JWT_SECRET=super-secret-jwt-key-for-development-only-replace-in-prod`
- `DEMO_ADMIN_EMAIL=admin@library.delhi`
- `DEMO_ADMIN_PASSWORD=LibraryDemo2026!`
- `DATABASE_URL=` (Leave blank to use embedded persistent PGlite PostgreSQL in `./data/postgres`)

### 3. Run Migrations & Seed Demo Data
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start the Application
Run both frontend and backend concurrently:
```bash
npm start
```
Or start them individually:
- Backend: `npm run server` (runs at `http://localhost:3005`)
- Frontend: `npm run client` (runs at `http://localhost:5174`)

---

## 5. Staff Admin Credentials (Development Seed)

- **URL**: `http://localhost:5174/admin/login`
- **Email**: `admin@library.delhi`
- **Password**: `LibraryDemo2026!`
- *(A one-click "Quick-fill demo admin credentials" button is also provided on the login page for rapid evaluation.)*

---

## 6. Automated Test Suite

The original 14 booking specifications and regression tests for persistence, concurrent updates, policy enforcement, and production security are included in `tests/`:

```bash
npm test
```

### Tested Behaviors:
1. Valid reservation is created and persisted with unguessable reference.
2. A full session rejects new reservations.
3. Concurrent requests cannot exceed capacity (ACID row locks).
4. Closed dates cannot be booked (respects Sunday/Monday closure).
5. Invalid dates and sessions are rejected by server-side Zod validation.
6. The daily booking limit (1 slot per person per day) is enforced.
7. Cancellation releases capacity atomically.
8. A cancelled booking cannot be checked in.
9. Invalid QR credentials and forged tokens are rejected.
10. A repeated check-in is rejected safely as a duplicate.
11. An unauthorized visitor cannot access staff administrative routes.
12. An unauthenticated API request cannot perform staff operations.
13. Schedule configuration changes immediately affect availability.
14. Booking retrieval masks emails (`k***o@example.com`) and protects private visitor details.

---

## 7. Security & Privacy Architecture

- **Opaque QR Code**: The check-in QR payload contains only `{ ref: "JF-2026-XXXXX", token: "random-crypto-hex" }`. It contains **no names, no emails, no phone numbers, and no membership IDs**.
- **Cryptographic Token Hashing**: Check-in tokens are stored as SHA-256 hashes in the database.
- **Enumeration Protection**: Public URLs use cryptographically random 5-character alphanumeric references (`JF-2026-XXXXX`) and require management tokens or matching email for retrieval. Sequential database IDs are never exposed.
- **HTTP-Only Cookies**: Staff authentication tokens are stored in `httpOnly`, `sameSite: 'lax'` cookies to prevent XSS exfiltration.
- **Centralized State Machine**: Status transitions (`confirmed` -> `checked_in` -> `completed` / `cancelled` / `no_show`) are governed by `statusService.js`. Direct or invalid transitions are strictly rejected.
- **Timezone Integrity**: All schedule evaluations, opening checks, and booking timestamps strictly use `Asia/Kolkata` (Indian Standard Time).

---

## 8. Limitations & Scope

- **Prototype Disclaimer**: This is an independent student prototype concept and has **no affiliation with The Japan Foundation, New Delhi**.
- **Fictional Data**: All capacities, member IDs, and schedules are demonstration placeholders.
- **Camera Access**: In local development, camera QR scanning requires `localhost` or an HTTPS origin due to browser WebRTC security policies. Manual booking reference search is provided as a seamless fallback.

## Production setup

Use an HTTPS `FRONTEND_ORIGIN`, unique `JWT_SECRET` and `COOKIE_SECRET` values of at least 32 characters, and a persistent database. Vercel deployments require `DATABASE_URL`; temporary serverless disk storage is not supported.

An empty production database creates no demo accounts or sample records. Supply `BOOTSTRAP_ADMIN_EMAIL` and a unique `BOOTSTRAP_ADMIN_PASSWORD` (at least 12 characters) to create the first administrator. Remove the bootstrap password after initialization. Essential spaces and sessions are created with zero capacity; set the real seat limits in Admin Settings before accepting bookings. The demo seed command is disabled in production.

Catalog, members, loans, fines, staff, and branches now use authenticated database-backed management APIs. Staff creation requires an initial password and administrator access. Loan issue/return updates inventory atomically. Conflicting edits are rejected instead of overwriting another staff member’s changes. Reports are calculated from stored records.

`npm test` always uses a new temporary database and a dynamically allocated API port. It never reads or resets the development database. Optional external PostgreSQL tests use `TEST_DATABASE_URL` and a separate temporary schema.
