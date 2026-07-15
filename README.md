# RepairIt 🔧

A home repair booking platform for Dhaka, Bangladesh. Customers book verified technicians, track jobs, and pay cash on completion.

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:3001

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Features

### Customer
- Browse service categories (Plumbing, Electrical, AC Repair, etc.)
- View technician profiles with ratings
- Book appointments with problem description
- Track booking status
- Leave reviews after completion

### Technician
- Apply for platform access
- View incoming job requests
- Update job status (accepted → en route → in progress → completed)
- Enter final price breakdown on completion

### Admin
- Login with access code (`admin123`)
- View platform statistics
- Approve/reject technician applications
- Monitor all bookings

## Demo Accounts

| Role | Login |
|------|-------|
| Customer | Any phone + name (new customers auto-register) |
| Technician | `01812345678` (Karim Miah - approved) |
| Admin | Access code: `admin123` |

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Express.js
- **Database**: JSON file (no setup needed)
- **Styling**: Inline styles (simple, no dependencies)

## Data Reset

Delete `backend/db.json` and restart the backend to reset to seed data.
