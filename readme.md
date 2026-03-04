# UCU Lock In — Study Arena

A gamified study platform for UCU students. Track study sessions, compete on the leaderboard, earn points, and spin the Lucky Charm.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Framer Motion
- **Auth:** JWT (httpOnly cookies), Argon2 password hashing

## Features

- **Pomodoro Timer** — study/break sessions
- **Dashboard** — real-time stats from DB (study time, streak, points)
- **Leaderboard** — ranked by study time, updates every minute
- **Lucky Charm** — server-side random, bet points and win rewards
- **Progress** — weekly/monthly charts, study calendar, achievements
- **Profile** — edit username, badges based on progress, reset/delete account
- **Themes** — 6 color themes (Cyber, Matrix, Sunset, Ocean, Neon, Gold)
- **Report System** — submit reports with image upload, saved to `reports/`

## Setup

### 1. Clone

```bash
git clone https://github.com/Den-Kachanov/LockIn.git
cd LockIn
```

### 2. Install Python dependencies

```bash
pip install fastapi uvicorn python-jose passlib argon2-cffi sqlalchemy email-validator python-multipart
```

### 3. Run server

```bash
uvicorn app.main:app --port 8000
```

### 4. Open in browser

```
http://localhost:8000
```

Register a new account or login with existing credentials.

### 5. (Optional) Rebuild frontend

Requires Node.js:

```bash
cd app/frontend
npm install
npm run build
cd ../..
```

## Project Structure

```
LockIn/
├── app/
│   ├── main.py              # FastAPI app, all API routes
│   ├── db/
│   │   ├── database.py      # SQLAlchemy engine setup
│   │   ├── models.py        # DB models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── app.db           # SQLite database (auto-created)
│   ├── frontend/
│   │   ├── src/             # React source code
│   │   └── dist/            # Built frontend (served by FastAPI)
│   ├── middleware/
│   │   └── logging.py       # Request logging middleware
│   ├── security_pages/
│   │   ├── login.html       # Login page
│   │   └── register.html    # Registration page
│   ├── secrets/             # Secret key for JWT
│   └── reports/             # Report files and images
├── config.py                # Path and config settings
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login, returns JWT |
| GET | `/api/dashboard/stats` | User stats (study time, points, streak) |
| GET | `/api/dashboard/leaderboard` | Top students ranking |
| POST | `/api/casino/spin` | Spin Lucky Charm (server random) |
| GET | `/api/casino/stats` | Lucky Charm statistics |
| GET | `/api/progress/stats` | Charts, calendar, achievements |
| GET | `/api/profile` | Full profile data |
| POST | `/api/profile/edit_username` | Change username |
| POST | `/api/report` | Submit violation report with image |
| POST | `/api/reset_progress` | Reset all progress |
| DELETE | `/api/delete_account` | Delete account |
| POST | `/api/logout` | Logout |

