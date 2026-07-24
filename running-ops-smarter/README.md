# Running Operations Smarter

A simple full-stack app for managing **staff, shift schedules, and tasks** in a healthcare operations setting.

## Stack
- **Backend:** Node.js + Express, REST API, JSON-file storage (`backend/data/db.json`) — no external database needed
- **Frontend:** Plain HTML/CSS/JS (no build step), served directly by the Express server

## Project Structure
```
running-ops-smarter/
├── backend/
│   ├── server.js       # Express app + all routes
│   ├── db.js           # tiny JSON-file "database" helper (CRUD)
│   ├── data/db.json     # seed data (staff, tasks, schedules)
│   └── package.json
└── frontend/
    ├── index.html       # tabs: Staff / Schedules / Tasks
    ├── style.css
    └── app.js           # fetch calls + rendering + modal forms
```

## Run it
```bash
cd backend
npm install
npm start
```
Then open **http://localhost:4000** in your browser. The frontend is served by the same server, so there's nothing else to start.

## API Endpoints
| Method | Path                        | Description                    |
|--------|-----------------------------|---------------------------------|
| GET    | /api/staff                  | List all staff                 |
| POST   | /api/staff                  | Create staff member            |
| PUT    | /api/staff/:id               | Update staff member            |
| DELETE | /api/staff/:id               | Remove staff member            |
| GET    | /api/tasks                   | List all tasks                 |
| POST   | /api/tasks                   | Create task                    |
| PUT    | /api/tasks/:id                | Update task                    |
| PATCH  | /api/tasks/:id/status         | Quick status update            |
| DELETE | /api/tasks/:id                | Remove task                    |
| GET    | /api/schedules                | List all shifts                |
| POST   | /api/schedules                | Create shift                   |
| PUT    | /api/schedules/:id             | Update shift                   |
| DELETE | /api/schedules/:id             | Remove shift                   |
| GET    | /api/summary                  | Dashboard counts                |
| GET    | /api/health                   | Health check                    |

## Features
- Add / edit / delete staff, shifts, and tasks through the UI (modal forms)
- Quick task status change via dropdown (Pending → In Progress → Done)
- Live summary bar: total staff, today's shifts, pending tasks, completed tasks
- Data persists to `backend/data/db.json` between restarts

## Extending it
- Swap `db.js` for a real database (Postgres/MongoDB) by reimplementing the same 5 functions (`getAll`, `getById`, `create`, `update`, `remove`) — the routes in `server.js` don't need to change.
- Add authentication by adding middleware in `server.js` before the route mounts.
- Add date filtering to `/api/schedules` for a real weekly calendar view.
