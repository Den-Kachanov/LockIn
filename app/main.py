# ==============================
# main.py
# ==============================

from datetime import datetime, timedelta, date
from pathlib import Path
import random
import json
import time
import os
import shutil

# -----------------------------
# CONFIG
# -----------------------------
from config import properties
from fastapi import (APIRouter, Depends, FastAPI, HTTPException, Request,
                     Response, UploadFile, File, Form)
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, create_engine, func, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from starlette.middleware.base import BaseHTTPMiddleware

from .db.database import get_db
from .db.schemas import (
    StatsResponse, TokenResponse, UserLogin, UserRegister,
    UserStats, LeaderboardEntry, LeaderboardResponse,
    CasinoSpinRequest, CasinoSpinResponse, CasinoStatsResponse
)
from .middleware.logging import LoggingMiddleware, logger

DB_PATH = properties["path"]["db"] / "app.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

SECRET_KEY = properties["secret_key"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

FRONT_END = properties["path"]["frontend"] / "dist"
SECURITY_PAGES = properties["path"]["security_pages"]

# -----------------------------
# DATABASE
# -----------------------------
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


# -----------------------------
# TABLES
# -----------------------------



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    points = Column(Integer, default=0)
    total_study_minutes = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    last_study_date = Column(String, nullable=True)


class StudySessionTable(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)


class CasinoSpinTable(Base):
    __tablename__ = "casino_spins"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bet_amount = Column(Integer, nullable=False)
    result_slots = Column(String, nullable=False)
    win_amount = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------------------
# DB
# -----------------------------


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)

# Migrate: add new columns to existing users table if missing
import sqlite3 as _sqlite3
_conn = _sqlite3.connect(str(DB_PATH))
_cursor = _conn.cursor()
_cursor.execute("PRAGMA table_info(users)")
_existing_cols = {row[1] for row in _cursor.fetchall()}
for _col, _type, _default in [
    ("points", "INTEGER", "0"),
    ("total_study_minutes", "INTEGER", "0"),
    ("current_streak", "INTEGER", "0"),
    ("last_study_date", "TEXT", "NULL"),
]:
    if _col not in _existing_cols:
        _cursor.execute(f"ALTER TABLE users ADD COLUMN {_col} {_type} DEFAULT {_default}")
_conn.commit()
# Give existing users starting points if they have 0
_cursor.execute("UPDATE users SET points = 1000 WHERE points = 0 OR points IS NULL")
_conn.commit()
_conn.close()

# -----------------------------
# SECURITY (JWT + hashing)
# -----------------------------
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hashes password
    """
    print(len(password))
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """
    Verifies password
    """
    return pwd_context.verify(password, hashed)


def create_access_token(username: str) -> str:
    """
    Creates access token (payload hashed by secret key)
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get user by access token
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user_from_cookie(request: Request):
    """Alternative auth: read JWT from cookie (for SPA API calls)."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI(title="Lockin API")
app.add_middleware(LoggingMiddleware)

# -----------------------------
# PROTECT SPA MIDDLEWARE
# -----------------------------
class AuthRequiredMiddleware(BaseHTTPMiddleware):
    """
    Protects SPA

    If user does not have / have invalid access token:
        redirect to login page
    """
    async def dispatch(self, request: Request, call_next):
        # Only protect SPA
        print(request.url)
        if request.url.path.startswith("/app/index.html"):
            token = request.cookies.get("access_token")
            print(token)
            if not token:
                return RedirectResponse("/login")
            try:
                jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                print("decoded")
            except JWTError:
                return RedirectResponse("/login")
        return await call_next(request)


app.add_middleware(AuthRequiredMiddleware)

# -----------------------------
# SPA
# -----------------------------
app.mount("/app", StaticFiles(directory=FRONT_END, html=True), name="frontend")


# -----------------------------
# SECURITY PAGES
# -----------------------------
@app.get("/login", response_class=FileResponse)
async def login_page():
    """Login page"""
    return SECURITY_PAGES / "login.html"


@app.get("/register", response_class=FileResponse)
async def register_page():
    """Register page"""
    return SECURITY_PAGES / "register.html"


# -----------------------------
# ROOT REDIRECT
# -----------------------------
@app.get("/")
async def root(request: Request):
    """Redirects if user does not have / have invalid access token"""
    token = request.cookies.get("access_token")
    if token:
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return RedirectResponse("/app/index.html")
        except JWTError:
            pass
    return RedirectResponse("/login")




# -----------------------------
# API ROUTES
# -----------------------------
api_router = APIRouter(prefix="/api")


@api_router.post("/register")
def register(data: UserRegister, response: Response, db: Session = Depends(get_db)):
    """
    POST register

    Validates nickname and register usar"""
    # check username
    if db.query(User).filter_by(username=data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=data.username,
        email=data.email,         # save email
        password_hash=hash_password(data.password),
        points=1000,              # starting bonus
    )
    db.add(user)
    db.commit()

    return {"message": "Registered successfully"}



@api_router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    POST login

    Validates credentials and returns access token
    """
    user = db.query(User).filter_by(username=data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.username)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        samesite="lax",
        secure=False
    )

    return TokenResponse(access_token=token)


@api_router.get("/stats", response_model=StatsResponse)
def stats(user=Depends(get_current_user)):
    """Stats"""
    return StatsResponse(user=user, progress=0)


# ---------------------------
# DASHBOARD API
# ---------------------------

@api_router.get("/dashboard/stats", response_model=UserStats)
def dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """
    Dashboard stats

    Stats of the user
    """
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Sessions today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    sessions_today = db.execute(
        text(f"SELECT COUNT(*) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{today_start.isoformat()}'")
    ).scalar() or 0

    # Weekly minutes
    week_start = today_start - timedelta(days=today_start.weekday())
    weekly_minutes = db.execute(
        text(f"SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{week_start.isoformat()}'")
    ).scalar() or 0

    return UserStats(
        username=db_user.username,
        total_study_minutes=db_user.total_study_minutes or 0,
        sessions_today=sessions_today,
        current_streak=db_user.current_streak or 0,
        points=db_user.points or 0,
        weekly_minutes=weekly_minutes,
    )


@api_router.get("/dashboard/leaderboard", response_model=LeaderboardResponse)
def dashboard_leaderboard(request: Request, db: Session = Depends(get_db)):
    """
    Leaderboard (Top students)
    """
    user = get_current_user_from_cookie(request)
    # Get all users sorted by total_study_minutes
    all_users = db.query(User).order_by(User.total_study_minutes.desc()).all()

    leaderboard = []
    my_rank = 0
    my_study_minutes = 0

    for i, u in enumerate(all_users):
        leaderboard.append(LeaderboardEntry(
            rank=i + 1,
            username=u.username,
            total_study_minutes=u.total_study_minutes or 0,
        ))
        if u.username == user:
            my_rank = i + 1
            my_study_minutes = u.total_study_minutes or 0

    return LeaderboardResponse(
        leaderboard=leaderboard[:10],  # top 10
        my_rank=my_rank,
        my_study_minutes=my_study_minutes,
    )


# ---------------------------
# CASINO API (server-side random)
# ---------------------------

SLOT_SYMBOLS = [
    {"label": "+0.1 Grade", "value": 100},
    {"label": "Pizza Slice", "value": 80},
    {"label": "Trophy", "value": 120},
    {"label": "Star Points", "value": 60},
    {"label": "Mystery Box", "value": 90},
    {"label": "Achievement", "value": 110},
    {"label": "Power Up", "value": 70},
    {"label": "Extra Life", "value": 85},
    {"label": "Royal Bonus", "value": 150},
    {"label": "Jackpot", "value": 200},
]


@api_router.post("/casino/spin", response_model=CasinoSpinResponse)
def casino_spin(data: CasinoSpinRequest, request: Request, db: Session = Depends(get_db)):
    """
    POST casino spin logic

    - Checks if user have enough points
    - Returns random slot position
    - Logs changes
    """
    start = time.perf_counter()  # track duration

    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        duration = time.perf_counter() - start
        client_ip = request.client.host if request.client else "-"
        logger.info("%s POST /casino/spin %s %.4fs", client_ip, 404, duration)
        raise HTTPException(status_code=404, detail="User not found")

    if (db_user.points or 0) < data.bet_amount:
        duration = time.perf_counter() - start
        client_ip = request.client.host if request.client else "-"
        logger.info("%s/%s casino spin %.4fs %s NOT ENOUGH POINTS", client_ip, db_user.username, 400, duration)
        raise HTTPException(status_code=400, detail="Not enough points")

    # Deduct bet
    points_before = db_user.points
    db_user.points = (db_user.points or 0) - data.bet_amount

    # Server generates random result
    slot0 = random.randint(0, len(SLOT_SYMBOLS) - 1)
    slot1 = random.randint(0, len(SLOT_SYMBOLS) - 1)
    slot2 = random.randint(0, len(SLOT_SYMBOLS) - 1)
    slots = [slot0, slot1, slot2]

    win_amount = 0
    is_jackpot = False
    is_double = False

    if slot0 == slot1 == slot2:
        is_jackpot = True
        win_amount = SLOT_SYMBOLS[slot0]["value"] * 3
    elif slot0 == slot1 or slot1 == slot2 or slot0 == slot2:
        is_double = True
        win_amount = int(data.bet_amount * 1.5)

    # Add winnings
    db_user.points += win_amount

    # Save spin record
    spin_record = CasinoSpinTable(
        user_id=db_user.id,
        bet_amount=data.bet_amount,
        result_slots=json.dumps(slots),
        win_amount=win_amount,
    )
    db.add(spin_record)
    db.commit()
    db.refresh(db_user)

    # Log the successful response
    duration = time.perf_counter() - start
    client_ip = request.client.host if request.client else "-"

    logger.info("%s/%s spin[%s, %s, %s] win: %s, balance: %s -> %s",
                client_ip, db_user.username,
                *(value for value in slots),
                win_amount,
                points_before,
                db_user.points or 0,
                )

    return CasinoSpinResponse(
        slots=slots,
        win_amount=win_amount,
        is_jackpot=is_jackpot,
        is_double=is_double,
        new_balance=db_user.points or 0,
    )



@api_router.get("/casino/stats", response_model=CasinoStatsResponse)
def casino_stats(request: Request, db: Session = Depends(get_db)):
    """
    POST casino stats logic

    - Updates db (wins, winrate, spin today, total winnings)

    """
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Spins today
    spins_today = db.execute(
        text(f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id} AND created_at >= '{today_start.isoformat()}'")
    ).scalar() or 0

    # Total winnings
    total_winnings = db.execute(
        text(f"SELECT COALESCE(SUM(win_amount), 0) FROM casino_spins WHERE user_id = {db_user.id}")
    ).scalar() or 0

    # Win rate
    total_spins = db.execute(
        text(f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id}")
    ).scalar() or 0

    wins = db.execute(
        text(f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id} AND win_amount > 0")
    ).scalar() or 0

    win_rate = (wins / total_spins * 100) if total_spins > 0 else 0.0

    return CasinoStatsResponse(
        total_points=db_user.points or 0,
        total_winnings=total_winnings,
        spins_today=spins_today,
        win_rate=round(win_rate, 1),
    )


# ---------------------------
# REPORTS API
# ---------------------------

REPORTS_DIR = properties["path"]["root"] / "reports"
REPORTS_FILE = REPORTS_DIR / "report.txt"
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


@api_router.post("/report")
async def submit_report(
    request: Request,
    student_name: str = Form(...),
    violation_type: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    """
    Submit a report about a violator.

    - Saves report info to report.txt
    - Creates folder reports/{report_number}/ with uploaded image
    - Image must be < 10 MB
    """
    user = get_current_user_from_cookie(request)

    # Create reports directory if not exists
    os.makedirs(REPORTS_DIR, exist_ok=True)

    # Determine report number
    report_number = 1
    if REPORTS_FILE.exists():
        with open(REPORTS_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in reversed(lines):
                if line.startswith("Report #"):
                    try:
                        report_number = int(line.split("#")[1].split()[0]) + 1
                    except (ValueError, IndexError):
                        pass
                    break

    # Create folder for this report
    report_folder = REPORTS_DIR / str(report_number)
    os.makedirs(report_folder, exist_ok=True)

    # Handle image upload
    image_filename = "no_image"
    if image and image.filename:
        # Check file size
        content = await image.read()
        if len(content) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Image too large. Maximum size is 10 MB, got {len(content) / 1024 / 1024:.1f} MB"
            )

        # Check that it's an image
        allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )

        # Save image
        image_filename = f"proof{ext}"
        image_path = report_folder / image_filename
        with open(image_path, "wb") as f:
            f.write(content)

    # Write to report.txt
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    report_entry = (
        f"Report #{report_number}\n"
        f"  Date: {timestamp}\n"
        f"  Reporter: {user}\n"
        f"  Student: {student_name}\n"
        f"  Violation: {violation_type}\n"
        f"  Description: {description}\n"
        f"  Image: {image_filename}\n"
        f"  Folder: reports/{report_number}/\n"
        f"{'-' * 40}\n"
    )

    with open(REPORTS_FILE, "a", encoding="utf-8") as f:
        f.write(report_entry)

    logger.info("Report #%s submitted by %s against %s (%s)",
                report_number, user, student_name, violation_type)

    return {
        "message": "Report submitted successfully",
        "report_number": report_number,
    }


# ---------------------------
# PROGRESS API
# ---------------------------

@api_router.get("/progress/stats")
def progress_stats(request: Request, db: Session = Depends(get_db)):
    """Get user progress data for charts and achievements."""
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    total_minutes = db_user.total_study_minutes or 0
    total_sessions = db.execute(
        text(f"SELECT COUNT(*) FROM study_sessions WHERE user_id = {db_user.id}")
    ).scalar() or 0

    # Weekly data (last 7 days)
    weekly = []
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = today - timedelta(days=today.weekday())
    for i in range(7):
        day_start = start_of_week + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        mins = db.execute(
            text(f"SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{day_start.isoformat()}' AND started_at < '{day_end.isoformat()}'")
        ).scalar() or 0
        weekly.append({"day": day_names[i], "hours": round(mins / 60, 1)})

    # Monthly data (last 4 weeks)
    monthly = []
    for w in range(4):
        w_start = today - timedelta(weeks=3 - w, days=today.weekday())
        w_end = w_start + timedelta(weeks=1)
        mins = db.execute(
            text(f"SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{w_start.isoformat()}' AND started_at < '{w_end.isoformat()}'")
        ).scalar() or 0
        monthly.append({"week": f"Week {w+1}", "hours": round(mins / 60, 1)})

    # Calendar data (current month - which days had activity)
    month_start = today.replace(day=1)
    if today.month == 12:
        next_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month + 1, day=1)

    calendar_rows = db.execute(
        text(f"SELECT DATE(started_at) as d, SUM(duration_minutes) as mins FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{month_start.isoformat()}' AND started_at < '{next_month.isoformat()}' GROUP BY DATE(started_at)")
    ).fetchall()
    calendar_data = {str(row[0]): int(row[1]) for row in calendar_rows}

    # Achievements - based on real data
    achievements = [
        {"name": "Study Marathon", "icon": "🏃", "progress": min(total_sessions, 100), "total": 100, "desc": "Complete 100 sessions"},
        {"name": "Night Owl", "icon": "🦉", "progress": min(total_minutes // 60, 20), "total": 20, "desc": "Study 20 hours total"},
        {"name": "Early Bird", "icon": "🐦", "progress": min(db_user.current_streak or 0, 30), "total": 30, "desc": "30 day streak"},
        {"name": "Consistency King", "icon": "👑", "progress": min(total_sessions, 50), "total": 50, "desc": "Complete 50 sessions"},
        {"name": "Point Collector", "icon": "💰", "progress": min((db_user.points or 0) // 100, 50), "total": 50, "desc": "Earn 5000 points"},
        {"name": "Casino Master", "icon": "🎰", "progress": min(
            db.execute(text(f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id}")).scalar() or 0, 100
        ), "total": 100, "desc": "Make 100 spins"},
    ]

    avg_session = round(total_minutes / max(total_sessions, 1))

    return {
        "total_study_minutes": total_minutes,
        "total_sessions": total_sessions,
        "avg_session_minutes": avg_session,
        "current_streak": db_user.current_streak or 0,
        "weekly": weekly,
        "monthly": monthly,
        "calendar": calendar_data,
        "achievements": achievements,
        "today_day": today.day,
        "month_name": today.strftime("%B %Y"),
    }


# ---------------------------
# PROFILE API
# ---------------------------

@api_router.get("/profile")
def get_profile(request: Request, db: Session = Depends(get_db)):
    """Get full profile data."""
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    total_sessions = db.execute(
        text(f"SELECT COUNT(*) FROM study_sessions WHERE user_id = {db_user.id}")
    ).scalar() or 0

    # Get rank
    all_users = db.query(User).order_by(User.total_study_minutes.desc()).all()
    my_rank = 1
    for i, u in enumerate(all_users):
        if u.username == user:
            my_rank = i + 1
            break

    total_minutes = db_user.total_study_minutes or 0

    # Badges based on progress
    badges = [
        {"icon": "🏃", "name": "Marathon", "unlocked": total_sessions >= 10},
        {"icon": "🔥", "name": "Streak", "unlocked": (db_user.current_streak or 0) >= 3},
        {"icon": "⚡", "name": "Speed", "unlocked": total_sessions >= 5},
        {"icon": "🦉", "name": "Night Owl", "unlocked": total_minutes >= 600},
        {"icon": "🐦", "name": "Early Bird", "unlocked": (db_user.current_streak or 0) >= 7},
        {"icon": "👑", "name": "Royalty", "unlocked": (db_user.points or 0) >= 5000},
    ]

    return {
        "username": db_user.username,
        "email": db_user.email,
        "points": db_user.points or 0,
        "total_study_minutes": total_minutes,
        "total_sessions": total_sessions,
        "current_streak": db_user.current_streak or 0,
        "rank": my_rank,
        "badges": badges,
        "notifications_on": True,
        "privacy_mode": False,
    }


@api_router.post("/profile/update")
def update_profile(
    request: Request,
    db: Session = Depends(get_db),
):
    """Update username."""
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Profile updated"}


@api_router.post("/profile/edit_username")
async def edit_username(request: Request, db: Session = Depends(get_db)):
    """Edit username."""
    user = get_current_user_from_cookie(request)
    body = await request.json()
    new_username = body.get("username", "").strip()

    if len(new_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(new_username) > 32:
        raise HTTPException(status_code=400, detail="Username must be at most 32 characters")

    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(User).filter_by(username=new_username).first()
    if existing and existing.id != db_user.id:
        raise HTTPException(status_code=400, detail="Username already taken")

    db_user.username = new_username
    db.commit()

    # Issue new token with new username
    token = create_access_token(new_username)
    return {"message": "Username updated", "new_token": token}


@api_router.post("/reset_progress")
def reset_progress(request: Request, db: Session = Depends(get_db)):
    """Reset all user progress."""
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.points = 1000
    db_user.total_study_minutes = 0
    db_user.current_streak = 0
    db_user.last_study_date = None

    db.execute(text(f"DELETE FROM study_sessions WHERE user_id = {db_user.id}"))
    db.execute(text(f"DELETE FROM casino_spins WHERE user_id = {db_user.id}"))
    db.commit()

    logger.info("User %s reset all progress", user)
    return {"message": "All progress has been reset"}


@api_router.delete("/delete_account")
def delete_account(request: Request, response: Response, db: Session = Depends(get_db)):
    """Delete user account permanently."""
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.execute(text(f"DELETE FROM study_sessions WHERE user_id = {db_user.id}"))
    db.execute(text(f"DELETE FROM casino_spins WHERE user_id = {db_user.id}"))
    db.delete(db_user)
    db.commit()

    response.delete_cookie("access_token", path="/")
    logger.info("User %s deleted account", user)
    return {"message": "Account deleted successfully"}


@api_router.post("/logout")
def logout(request: Request, response: Response):
    """Logout - clear cookie."""
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out successfully"}


app.include_router(api_router)
