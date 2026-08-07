# FINAL Antigravity Build Prompt — Heaven Heights App (Complete)

Copy-paste everything below (from "Build a full-stack..." to the end) into Antigravity's Claude core in one go.

---

Build a full-stack web application called **"Heaven Heights"** — a residential society / property management portal.

## Tech Stack
- **Frontend:** React (Vite, React Router, functional components + hooks)
- **Backend:** Node.js + Express.js (REST API)
- **Database:** MongoDB (Mongoose)
- **Styling:** Tailwind CSS

## Project Structure
```
/client   -> React frontend
/server   -> Node + Express backend
```
- `/server`: `models/`, `routes/`, `controllers/`, `config/db.js`, `server.js`
- `/client`: `components/`, `pages/`, `layouts/`, `api/` (axios calls)
- `.env` for MongoDB URI and PORT on backend.
- `npm run dev` should start both frontend (Vite) and backend concurrently.

## Design System (apply everywhere, consistently)
- **Layout:** Fixed left sidebar (collapsible) + top navbar + main content area.
- **Sidebar:** Logo + "Heaven Heights" + subtitle "Company Portal". Uppercase gray section labels grouping nav items. Active item = orange left-border + orange text + light orange background. Expandable sub-menus with chevron icons.
- **Top navbar:** Left hamburger icon to collapse sidebar. Right: theme toggle, fullscreen icon, overlapping avatar group with "+N" badge, notification icon, logged-in user name + role + photo.
- **Page header:** Bold title + gray subtitle. Top-right: primary orange filled button (main action) + secondary outline buttons (view toggles).
- **Stat cards row:** Small cards with label, big number, colored icon (people/clock/check/cross). Active/selected card gets an orange border.
- **Filter bar:** Filter icon button + search input with icon + dropdown filters + "Columns" button.
- **Data table:** Uppercase gray headers, thin borders, colored status pill badges, Actions column. Empty state: centered gray icon + "No records found" + helper subtext.
- **Colors:** Primary orange (#F97316), background white/#F9FAFB, headings #111827, subtext #6B7280. Status colors: green=completed/present, amber=pending, red=absent/overdue, blue=scheduled, gray=neutral/leave.
- **Font:** Inter or similar clean sans-serif, rounded-xl corners, subtle card shadows.
- Build one shared Sidebar + Topbar layout component — reuse across every module, don't duplicate.
- Simple role-based dummy login (Admin, Manager, Coordinator) — store role in context, no need for full security yet.

## Sidebar Navigation (full structure)
```
Lead Management
  └── Site Visit Schedule
People & Operations
  ├── Housekeeping
  ├── Security
  │     ├── Patrol Checkpoints
  │     │     ├── Submissions
  │     │     └── Reports
  │     └── Night Guard
  │           ├── Submissions
  │           ├── Daily Report (coordinator)
  │           └── Admin Report View (read-only)
  ├── Attendance
  ├── Task Delegation
  └── HRMS
Admin
  └── Team Management
```

---

# MODULE 1: Housekeeping

- Stat cards: All Tasks, Today's Tasks, Scheduled, Pending/Overdue, Completed, Skipped
- Table columns: Created At, Area/Room Name, Task Type (Sweeping/Mopping/Deep Clean etc.), Assigned Staff, Block/Floor, Frequency (Daily/Weekly), Status, Verified By, Actions
- Features: create/assign task to staff for a specific area; mark Completed/Not Done with optional photo; filter by block/staff/status/date; room-wise/block-wise status view.
- Mongoose model: `HousekeepingTask`.
- API: `GET/POST /api/housekeeping`, `PUT/DELETE /api/housekeeping/:id`.

---

# MODULE 2: Security (two sub-systems)

## Guard Master Data & Site-wise Filtering
Seed the `Guard` collection from the attached `guard_master_seed.csv` (columns: EmployeeID, Name, SiteName, Module, FormActive). Rules:
- Every guard belongs to exactly **one fixed site** — a Garden City guard never appears on the Nature Park form, etc.
- `Module` column tags each guard's site as `patrol_checkpoint`, `night_guard`, or `pending` (site not yet built: Mahalgaon New Site, Badagaon New Site, Girwai, Marigold — keep these guards in the master list but their site has no active public form yet).
- **Guard Name dropdown must always be filtered by the currently selected site/project**, never a flat list of all guards. On `/patrol-form/:project`, only show guards whose SiteName matches. On `/night-guard-form`, filter Guard Name to the selected Project Name's guards.
- "Tekanpur New Site" has been renamed to **"Wildflower"** — use Wildflower everywhere (patrol_checkpoint type, 5 checkpoints).
- Give Admin a screen to bulk re-import this CSV and to add/edit individual guards later.

## Sub-module 2A: Patrol Checkpoints

**Projects & checkpoint counts (seed as master data):**
| Project | Checkpoints |
|---|---|
| Garden City | 15 |
| Regal Garden | 10 |
| Nature Park | 10 |
| School | 6 |
| Wildflower | 5 |

**Data models:**
```
Project { projectId, name, module: "patrol_checkpoint", checkpointCount }
Checkpoint { projectId, checkpointId, name, order }
PatrolSubmission {
  projectId, projectName, guardName, submittedAt,
  photos: [ { checkpointId, photoUrl, capturedAt, geoLocation: {lat, lng, address} } ]
  // fewer entries than checkpointCount is fine — no checkpoint is mandatory
}
```

**Public guard form** (no login), one route per project:
`/patrol-form/garden-city`, `/patrol-form/regal-garden`, `/patrol-form/nature-park`, `/patrol-form/school`, `/patrol-form/wildflower`
- Dynamically renders exactly that project's checkpoint count (never hardcoded).
- Fields: Guard Name (dropdown, filtered by site), Checkpoint 1..N Photo (camera-capture buttons, all optional), Submit (always enabled once Guard Name chosen).

**Coordinator view:** project selector + date filter → submissions table (Guard Name, Submitted At, Checkpoints Covered e.g. "8/15", View Photos action) → photo gallery with capture time + geo-location per checkpoint.

## Sub-module 2B: Night Guard

**Projects (separate master list):** One Business Center, Hyde Park, Milestone, GST

**Data models:**
```
NightGuardSubmission {
  // guard's own proof-of-presence photo — reference only, NOT auto-converted into the report
  guardName, projectName, guardPhotoUrl, capturedAt, geoLocation, submittedAt
}

NightGuardReportEntry {
  reportDate,
  site,          // coordinator selects (One Business Center, Hyde Park, Milestone, GST)
  timeSlot,      // fixed hourly: 9:00 PM, 10:00 PM, 11:00 PM, 12:00 AM, 1:00 AM, 2:00 AM, 3:00 AM, 4:00 AM, 5:00 AM, 6:00 AM
  guardName,     // coordinator selects, filtered to that site's guards
  status,        // dropdown, EXACT options in this order: "Present", "Absent", "Leave", "NA", "Holiday", "Not ok", "Timestamp missing", "Form not fill", "Blur image", "wrong image"
  linkedSubmissionId  // optional reference to the NightGuardSubmission checked against
}

NightGuardDailyReport {
  reportDate,
  entries: [ NightGuardReportEntry, ... ],
  status: "draft" / "submitted",
  preparedBy: coordinatorId,
  submittedAt
}
```

**Public guard form** (no login): `/night-guard-form`
Fields: Guard Name (dropdown, filtered by selected Project), Project Name (dropdown: One Business Center, Hyde Park, Milestone, GST), Guard Photo (single camera-capture), Submit.
This is proof/reference data only — it does not auto-fill the report.

**Coordinator — Daily Report Builder** (manual grid, spreadsheet-style):
- Date picker (default today, editable for past dates).
- Grid: Site (dropdown) | Time (fixed 9PM-6AM slots) | Guard Name (dropdown, filtered) | Status (dropdown, exact 10 options above) | Proof (view matching submissions for that site+hour in a modal, to cross-check before selecting Guard Name/Status).
- Color-code status badges: green = Present, red = Absent, gray = Leave/NA/Holiday, amber = the proof-quality issues (Not ok, Timestamp missing, Form not fill, Blur image, wrong image).
- "Add Row" for extra entries.
- **"Save as Draft"** vs **"Submit Report"** — submitting locks the report (`status: "submitted"`), timestamps it, and pushes it to the Admin Dashboard; becomes read-only for the coordinator unless an admin unlocks it.

**Admin Dashboard (read-only):** list of submitted `NightGuardDailyReport`s (Date, Prepared By, Sites covered, Present/Absent counts, Submitted At) → click to view full grid read-only with proof photos → filter by date range/site → Export to Excel/CSV.

## Camera & Geo-stamp Logic (shared across Housekeeping photo uploads AND both Security sub-modules)
For every photo-capture field:
1. `<input type="file" accept="image/*" capture="environment">` (or `getUserMedia` custom camera UI) so it opens the **device camera directly**, not gallery.
2. On capture, call `navigator.geolocation.getCurrentPosition()` for lat/lng, reverse-geocode to address if possible.
3. Draw photo onto an HTML5 `<canvas>` and burn in a text stamp (Date • Time • Lat,Lng/address) into the pixels before upload — non-editable, always visible.
4. Upload stamped image to Cloudinary (or Google Drive API to match existing workflow); store URL + lat/lng separately in DB.
5. Show thumbnail + green checkmark once captured successfully.

## Security Module — Access Rules
- Public forms (`/patrol-form/:project`, `/night-guard-form`) — no login required, shareable via WhatsApp link.
- Coordinator role — submits patrol reviews, builds/submits Night Guard daily reports.
- Admin role — read-only across both sub-modules, can unlock a submitted report for correction.

---

# MODULE 3: Attendance

- Stat cards: Total Staff, Present Today, Absent, On Leave, Late Check-in, Pending Approval
- Table columns: Date, Staff Name, Employee ID, Department (Housekeeping/Guard/Admin), Check-in Time, Check-out Time, Status (Present/Absent/Half-day/Leave), Marked By, Actions
- Features: manual check-in/check-out per staff; monthly attendance sheet (calendar grid per employee); leave request + approval flow; auto-flag late arrivals vs shift start time.
- Mongoose model: `Attendance`, shared `Employee` model (name, phone, department, role, photo) reused by Housekeeping + Security + Attendance.
- API: `GET/POST /api/attendance`, `PUT/DELETE /api/attendance/:id`.

---

## Shared Requirements (all 3 modules)
- Every module page: page header + action button, stat cards row, filter/search bar, data table with empty state, List/Calendar + Dashboard view toggle — matching the design system above.
- REST APIs for each module following the same pattern: `GET/POST /api/<module>`, `PUT/DELETE /api/<module>/:id`.
- Seed master data on first run: Housekeeping areas, Security projects/checkpoints (table above), Guard list (from CSV), Attendance departments.

## Deliverable
A working local dev setup (`npm run dev` runs React + Express concurrently, connected to MongoDB via `.env` URI) with all 3 modules fully functional — live CRUD, real stat-card counts from DB, dynamic project-wise checkpoint forms, camera+geostamp capture, coordinator daily report grid with draft/submit flow, and admin dashboards showing submitted reports read-only with export.

---
