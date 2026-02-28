# 🔒 LockIn — UCU Study Arena

A gamified study platform for UCU students. Study, earn stars, compete on the leaderboard, spin the casino, report violators, and join study groups — all in one app.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [API Overview](#api-overview)

---

## ✨ Features

### 📊 Dashboard
- **Pomodoro Timer** — 25-minute study sessions with 5-minute breaks
- **Stars Reward System** — earn 10 ⭐ automatically when a study session completes
- **Your Stats** — total study time, sessions today, streak, points balance, weekly goal progress
- **Leaderboard** — top 10 students ranked by total study time

### 🎰 Casino
- 3 slot machines with different bet amounts (50 / 100 / 200 ⭐)
- Server-side random — fair play guaranteed
- Match 3 symbols = jackpot, match 2 = 1.5x bet
- Win/loss history tracked in database

### 👥 Community
- 8 study groups to join (one at a time)
- 5 active challenges with progress tracking
- Real-time activity feed — shows actual jackpots, completed sessions, and streaks from the database

### 🚨 Report System
- Report violators with name, violation type, description and photo proof
- Reports saved to `reports/report.txt` with numbered entries
- Images stored in `reports/<number>/` folders
- 10 MB file size limit, image files only

### 📈 Progress & Profile
- Personal progress tracking
- User profile management

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Python 3.13, FastAPI, Uvicorn |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT (stored in HTTP-only cookies) |
| Password Hashing | Argon2 |

---

## 📁 Project Structure

```
LockIn-master/
├── app/
│   ├── main.py                  # FastAPI app, all API routes
│   ├── config.py                # App configuration (paths, secret key)
│   ├── db/
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models.py            # ORM models
│   │   └── schemas.py           # Pydantic schemas
│   ├── middleware/
│   │   └── logging.py           # Request logging middleware
│   ├── security_pages/
│   │   ├── login.html           # Login page
│   │   └── register.html        # Register page
│   ├── frontend/                # React frontend (Vite)
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── App.tsx      # Main app, page routing
│   │   │       ├── pages/
│   │   │       │   ├── Dashboard.tsx
│   │   │       │   ├── Casino.tsx
│   │   │       │   ├── Community.tsx
│   │   │       │   ├── Progress.tsx
│   │   │       │   ├── Rewards.tsx
│   │   │       │   └── Profile.tsx
│   │   │       └── components/
│   │   │           ├── PomodoroTimer.tsx
│   │   │           ├── SlotMachine.tsx
│   │   │           ├── Leaderboard.tsx
│   │   │           └── ReportSection.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── reports/                 # Auto-created on first report
│       ├── report.txt
│       └── <report_number>/
│           └── proof.<ext>
├── config.py                    # Root config
├── requirements.txt             # Python dependencies
└── README.md
```

---

## ⚙️ Requirements

- **Python 3.10+** (developed on 3.13)
- **Node.js 18+** and **npm**
- All Python packages listed in `requirements.txt`

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Den-Kachanov/LockIn.git
cd LockIn
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd app/frontend
npm install
cd ../..
```

---

## 🚀 Running the App

You need **two terminals** open at the same time.

### Terminal 1 — Build the frontend

> Run this every time you make changes to frontend files.

```bash
cd app/frontend
npm run build
```

Wait for it to finish, then go back to the root folder:

```bash
cd ../..
```

### Terminal 2 — Start the backend

> Run this from the **root folder** of the project (the one that *contains* the `app` folder).

```bash
uvicorn app.main:app --port 8000 --reload
```

### Open the app

Go to **http://localhost:8000** in your browser.

> ⚠️ Make sure to open `localhost:8000`, NOT `localhost:5173`.
> The backend serves the built frontend — cookies and auth only work correctly this way.

---

## 🔄 Development Workflow

```
1. Edit frontend files  (e.g. Dashboard.tsx)
2. npm run build        (in app/frontend terminal)
3. Refresh localhost:8000
```

```
1. Edit backend files   (e.g. main.py)
2. Uvicorn auto-reloads (--reload flag handles this)
3. Refresh localhost:8000
```

---

## 🌐 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login, sets auth cookie |
| GET | `/api/dashboard/stats` | Get current user stats |
| GET | `/api/dashboard/leaderboard` | Get top 10 leaderboard |
| POST | `/api/study/complete` | Record a study session, award 10 ⭐ |
| POST | `/api/casino/spin` | Spin a slot machine |
| GET | `/api/casino/stats` | Get casino stats for current user |
| GET | `/api/community/stats` | Get real community stats (user counts) |
| GET | `/api/community/activity` | Get real activity feed |
| POST | `/api/report` | Submit a violation report with optional image |

---

## 🗄️ Database

SQLite database is auto-created at first run. Tables:

- `users` — username, email, password hash, points, study minutes, streak
- `study_sessions` — session records with duration and timestamps
- `casino_spins` — spin records with bet, result slots, win amount

No manual setup needed — everything is created automatically on startup.

---

## 👥 Authors

UCU LockIn Team — 2026
