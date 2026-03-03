# ==============================
# main.py
# ==============================

from datetime import datetime, timedelta, date
from logging import log
from pathlib import Path
import random
import json
import time
import os
import shutil

# -----------------------------
# CONFIG
# -----------------------------
from pydantic import BaseModel
from config import properties
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    HTTPException,
    Request,
    Response,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    create_engine,
    func,
    text,
)
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from starlette.middleware.base import BaseHTTPMiddleware

from .db.database import get_db
from .db.schemas import (
    StatsResponse,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserStats,
    LeaderboardEntry,
    LeaderboardResponse,
    CasinoSpinRequest,
    CasinoSpinResponse,
    CasinoStatsResponse,
    GroupOut,
    ChallengeOut,
)
from .db.models import Reward, RewardPurchase
from .middleware.logging import LoggingMiddleware, logger, purchase_logger
from sqlalchemy import Table, Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from fastapi import Depends, Request, HTTPException
from sqlalchemy.orm import Session
import json
import sqlite3 as _sqlite3

DB_PATH = properties["path"]["db"] / "app.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

SECRET_KEY = properties["secret_key"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 14

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
user_challenges = Table(
    "user_challenges",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("challenge_id", Integer, ForeignKey("challenges.id"), primary_key=True),
)


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
    theme = Column(String, default="cyber")
    group_id = Column(Integer, ForeignKey("study_groups.id"), nullable=True)
    challenges = relationship("UserChallenge", back_populates="user")


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


class Reward(Base):
    __tablename__ = "rewards"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cost = Column(Integer, nullable=False)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    available = Column(Integer, default=1)


class RewardPurchase(Base):
    __tablename__ = "reward_purchases"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id"), nullable=False)
    points_spent = Column(Integer, nullable=False)
    purchased_at = Column(DateTime, default=datetime.utcnow)


class StudyGroup(Base):
    __tablename__ = "study_groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    subject = Column(String)
    members = Column(Integer, default=0)
    active = Column(Integer, default=0)
    color = Column(String, default="#00d9ff")
    emoji = Column(String, default="📚")  # <- new column


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    progress = Column(Integer, default=0)
    total = Column(Integer, default=100)
    reward = Column(Integer, default=0)
    participants = Column(Integer, default=0)
    time_left = Column(String)
    unit = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    users = relationship("User", secondary=user_challenges, back_populates="challenges")


class Activity(Base):
    __tablename__ = "activity"
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    action = Column(String)
    avatar = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ChallengeCreate(BaseModel):
    title: str
    description: str
    total: int = 100
    reward: int = 0  # points or reward id
    time_left: str = "7d"


class ChallengeProgressUpdate(BaseModel):
    challenge_id: int
    progress: int  # new progress value


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), primary_key=True)

    progress = Column(Integer, default=0)
    completed = Column(Integer, default=0)

    user = relationship("User", back_populates="user_challenges")
    challenge = relationship("Challenge")


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
        _cursor.execute(
            f"ALTER TABLE users ADD COLUMN {_col} {_type} DEFAULT {_default}"
        )
_conn.commit()
# Give existing users starting points if they have 0
_cursor.execute("UPDATE users SET points = 1000 WHERE points = 0 OR points IS NULL")
_conn.commit()
_conn.close()

# -----------------------------
# LOAD DEFAULT REWARDS FROM JSON
# -----------------------------

REWARDS_JSON = properties["path"]["rewards"] / "rewards.json"


def load_rewards():
    """Load rewards from JSON into DB if not already present."""
    if not REWARDS_JSON.exists():
        print("Rewards JSON not found, skipping load.")
        return

    with open(REWARDS_JSON, "r", encoding="utf-8") as f:
        rewards_data = json.load(f)

    db = SessionLocal()
    loaded_count = 0
    for r in rewards_data:
        if db.query(Reward).filter_by(name=r["name"]).first():
            continue  # skip if already exists
        reward = Reward(
            name=r["name"],
            description=r.get("description", ""),
            cost=r.get("cost", 0),
            icon=r.get("icon"),
            color=r.get("color"),
            available=r.get("available", 1),
        )
        db.add(reward)
        loaded_count += 1
    db.commit()
    db.close()
    print(f"Loaded {loaded_count} new rewards from JSON")


def seed_challenges_and_groups():
    db = SessionLocal()

    # ----------------------------
    # Seed Study Groups
    # ----------------------------
    if db.query(StudyGroup).count() == 0:
        default_groups = [
            {
                "name": "Math Wizards",
                "subject": "Mathematics",
                "color": "#FF5733",
                "emoji": "🧮",
            },
            {
                "name": "History Buffs",
                "subject": "History",
                "color": "#33FF57",
                "emoji": "🏺",
            },
            {
                "name": "Science Squad",
                "subject": "Science",
                "color": "#3357FF",
                "emoji": "🔬",
            },
            {
                "name": "Language Learners",
                "subject": "Languages",
                "color": "#FF33A1",
                "emoji": "📝",
            },
        ]
        for g in default_groups:
            group = StudyGroup(
                name=g["name"],
                subject=g["subject"],
                color=g["color"],
                members=0,
                active=0,
            )
            db.add(group)
        print(f"Seeded {len(default_groups)} study groups.")

    # ----------------------------
    # Seed Challenges
    # ----------------------------
    if db.query(Challenge).count() == 0:
        default_challenges = [
            {
                "title": "Study 5 Hours",
                "description": "Accumulate 300 minutes of study",
                "total": 300,
                "reward": 100,
                "time_left": "7d",
                "unit": "minutes",
                "icon": "⏱️",
            },
            {
                "title": "Night Owl Challenge",
                "description": "Study after 10 PM",
                "total": 10,
                "reward": 50,
                "time_left": "3d",
                "unit": "sessions",
                "icon": "🌙",
            },
            {
                "title": "Weekly Marathon",
                "description": "Study 10 sessions in a week",
                "total": 10,
                "reward": 150,
                "time_left": "7d",
                "unit": "sessions",
                "icon": "🏃",
            },
            {
                "title": "Point Collector",
                "description": "Earn 1000 points",
                "total": 1000,
                "reward": 200,
                "time_left": "14d",
                "unit": "points",
                "icon": "💎",
            },
            # Casino-specific challenges
            {
                "title": "Casino Master",
                "description": "Make 100 spins in the Lucky Charm",
                "total": 100,
                "reward": 300,
                "time_left": "30d",
                "unit": "spins",
                "icon": "🎰",
            },
            {
                "title": "Lucky Winner",
                "description": "Win 500 points from Lucky Charm",
                "total": 500,
                "reward": 150,
                "time_left": "14d",
                "unit": "points",
                "icon": "🍀",
            },
            {
                "title": "Jackpot Hunter",
                "description": "Hit 5 jackpots",
                "total": 5,
                "reward": 500,
                "time_left": "21d",
                "unit": "jackpots",
                "icon": "💰",
            },
        ]

        for c in default_challenges:
            challenge = Challenge(
                title=c["title"],
                description=c["description"],
                total=c["total"],
                reward=c["reward"],
                progress=0,
                participants=0,
                time_left=c["time_left"],
                unit=c["unit"],  # now included
                icon=c["icon"],  # now included
            )
            db.add(challenge)
        print(f"Seeded {len(default_challenges)} challenges.")

    db.commit()
    db.close()


# Call the loader
load_rewards()
seed_challenges_and_groups()

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
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/app"):
            token = request.cookies.get("access_token")
            if not token:
                return RedirectResponse("/login")
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                username = payload.get("sub")
                if not username:
                    return RedirectResponse("/login")

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
        email=data.email,  # save email
        password_hash=hash_password(data.password),
        points=100000,  # starting bonus
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
        secure=False,
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
    sessions_today = (
        db.execute(
            text(
                f"SELECT COUNT(*) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{today_start.isoformat()}'"
            )
        ).scalar()
        or 0
    )

    # Weekly minutes
    week_start = today_start - timedelta(days=today_start.weekday())
    weekly_minutes = (
        db.execute(
            text(
                f"SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{week_start.isoformat()}'"
            )
        ).scalar()
        or 0
    )

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
        leaderboard.append(
            LeaderboardEntry(
                rank=i + 1,
                username=u.username,
                total_study_minutes=u.total_study_minutes or 0,
            )
        )
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
def casino_spin(
    data: CasinoSpinRequest, request: Request, db: Session = Depends(get_db)
):
    """
    POST casino spin logic

    - Checks if user have enough points
    - Returns random slot position
    - Updates challenge progress automatically
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
        logger.info(
            "%s/%s casino spin %.4fs %s NOT ENOUGH POINTS",
            client_ip,
            db_user.username,
            400,
            duration,
        )
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

    # Update challenge progress for challenges user is participating in
    challenge_updates = []
    if hasattr(db_user, "challenges") and db_user.challenges:
        for challenge in db_user.challenges:
            progress_added = 0

            if challenge.unit == "points" and win_amount > 0:
                # For challenges like "Point Collector" - only count winnings
                progress_added = win_amount
                challenge.progress = min(
                    challenge.progress + progress_added, challenge.total
                )
                challenge_updates.append(f"{challenge.title}: +{progress_added} points")

            elif challenge.unit == "spins" or (
                challenge.unit == "sessions" and "casino" in challenge.title.lower()
            ):
                # For challenges like "Casino Master" - count each spin
                progress_added = 1
                challenge.progress = min(
                    challenge.progress + progress_added, challenge.total
                )
                challenge_updates.append(f"{challenge.title}: +1 spin")

            elif challenge.unit == "jackpots" and is_jackpot:
                # For potential jackpot-specific challenges
                progress_added = 1
                challenge.progress = min(
                    challenge.progress + progress_added, challenge.total
                )
                challenge_updates.append(f"{challenge.title}: +1 jackpot")

            # Check if challenge is completed
            if challenge.progress >= challenge.total and progress_added > 0:
                # Award challenge reward
                db_user.points += challenge.reward
                db_user.challenge.completed = 1
                challenge_updates.append(
                    f"🎉 {challenge.title} COMPLETED! +{challenge.reward} bonus points!"
                )

    db.commit()
    db.refresh(db_user)

    # Log the successful response
    duration = time.perf_counter() - start
    client_ip = request.client.host if request.client else "-"

    logger.info(
        "%s/%s spin[%s, %s, %s] win: %s, balance: %s -> %s. Challenge updates: %s",
        client_ip,
        db_user.username,
        *(value for value in slots),
        win_amount,
        points_before,
        db_user.points or 0,
        ", ".join(challenge_updates) if challenge_updates else "None",
    )

    return CasinoSpinResponse(
        slots=slots,
        win_amount=win_amount,
        is_jackpot=is_jackpot,
        is_double=is_double,
        new_balance=db_user.points or 0,
        challenge_updates=challenge_updates,  # Add this field to the response
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
    spins_today = (
        db.execute(
            text(
                f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id} AND created_at >= '{today_start.isoformat()}'"
            )
        ).scalar()
        or 0
    )

    # Total winnings
    total_winnings = (
        db.execute(
            text(
                f"SELECT COALESCE(SUM(win_amount), 0) FROM casino_spins WHERE user_id = {db_user.id}"
            )
        ).scalar()
        or 0
    )

    # Win rate
    total_spins = (
        db.execute(
            text(f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id}")
        ).scalar()
        or 0
    )

    wins = (
        db.execute(
            text(
                f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id} AND win_amount > 0"
            )
        ).scalar()
        or 0
    )

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
                detail=f"Image too large. Maximum size is 10 MB, got {len(content) / 1024 / 1024:.1f} MB",
            )

        # Check that it's an image
        allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}",
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

    logger.info(
        "Report #%s submitted by %s against %s (%s)",
        report_number,
        user,
        student_name,
        violation_type,
    )

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
    total_sessions = (
        db.execute(
            text(f"SELECT COUNT(*) FROM study_sessions WHERE user_id = {db_user.id}")
        ).scalar()
        or 0
    )

    # Weekly data (last 7 days)
    weekly = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = today - timedelta(days=today.weekday())
    for i in range(7):
        day_start = start_of_week + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        mins = (
            db.execute(
                text(
                    f"SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{day_start.isoformat()}' AND started_at < '{day_end.isoformat()}'"
                )
            ).scalar()
            or 0
        )
        weekly.append({"day": day_names[i], "hours": round(mins / 60, 1)})

    # Monthly data (last 4 weeks)
    monthly = []
    for w in range(4):
        w_start = today - timedelta(weeks=3 - w, days=today.weekday())
        w_end = w_start + timedelta(weeks=1)
        mins = (
            db.execute(
                text(
                    f"SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{w_start.isoformat()}' AND started_at < '{w_end.isoformat()}'"
                )
            ).scalar()
            or 0
        )
        monthly.append({"week": f"Week {w+1}", "hours": round(mins / 60, 1)})

    # Calendar data (current month - which days had activity)
    month_start = today.replace(day=1)
    if today.month == 12:
        next_month = today.replace(year=today.year + 1, month=1, day=1)
    else:
        next_month = today.replace(month=today.month + 1, day=1)

    calendar_rows = db.execute(
        text(
            f"SELECT DATE(started_at) as d, SUM(duration_minutes) as mins FROM study_sessions WHERE user_id = {db_user.id} AND started_at >= '{month_start.isoformat()}' AND started_at < '{next_month.isoformat()}' GROUP BY DATE(started_at)"
        )
    ).fetchall()
    calendar_data = {str(row[0]): int(row[1]) for row in calendar_rows}

    # Achievements - based on real data
    achievements = [
        {
            "name": "Study Marathon",
            "icon": "🏃",
            "progress": min(total_sessions, 100),
            "total": 100,
            "desc": "Complete 100 sessions",
        },
        {
            "name": "Night Owl",
            "icon": "🦉",
            "progress": min(total_minutes // 60, 20),
            "total": 20,
            "desc": "Study 20 hours total",
        },
        {
            "name": "Early Bird",
            "icon": "🐦",
            "progress": min(db_user.current_streak or 0, 30),
            "total": 30,
            "desc": "30 day streak",
        },
        {
            "name": "Consistency King",
            "icon": "👑",
            "progress": min(total_sessions, 50),
            "total": 50,
            "desc": "Complete 50 sessions",
        },
        {
            "name": "Point Collector",
            "icon": "💰",
            "progress": min((db_user.points or 0) // 100, 50),
            "total": 50,
            "desc": "Earn 5000 points",
        },
        {
            "name": "Casino Master",
            "icon": "🎰",
            "progress": min(
                db.execute(
                    text(
                        f"SELECT COUNT(*) FROM casino_spins WHERE user_id = {db_user.id}"
                    )
                ).scalar()
                or 0,
                100,
            ),
            "total": 100,
            "desc": "Make 100 spins",
        },
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

    total_sessions = (
        db.execute(
            text(f"SELECT COUNT(*) FROM study_sessions WHERE user_id = {db_user.id}")
        ).scalar()
        or 0
    )

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
        {
            "icon": "🐦",
            "name": "Early Bird",
            "unlocked": (db_user.current_streak or 0) >= 7,
        },
        {"icon": "👑", "name": "Royalty", "unlocked": (db_user.points or 0) >= 5000},
    ]

    group = None
    if db_user.group_id:
        db_group = db.query(StudyGroup).filter_by(id=db_user.group_id).first()
        if db_group:
            group = {
                "id": db_group.id,
                "name": db_group.name,
                "subject": db_group.subject,
                "color": db_group.color,
                "emoji": db_group.emoji,
                "members": db_group.members,
            }

    return {
        "username": db_user.username,
        "email": db_user.email,
        "points": db_user.points or 0,
        "total_study_minutes": total_minutes,
        "total_sessions": total_sessions,
        "current_streak": db_user.current_streak or 0,
        "rank": my_rank,
        "badges": badges,
        "group": group,
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
async def edit_username(
    request: Request, response: Response, db: Session = Depends(get_db)
):
    """Edit username and issue new JWT token in cookie."""
    user = get_current_user_from_cookie(request)
    body = await request.json()
    new_username = body.get("username", "").strip()

    if len(new_username) < 3:
        raise HTTPException(
            status_code=400, detail="Username must be at least 3 characters"
        )
    if len(new_username) > 32:
        raise HTTPException(
            status_code=400, detail="Username must be at most 32 characters"
        )

    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(User).filter_by(username=new_username).first()
    if existing and existing.id != db_user.id:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Update username
    db_user.username = new_username
    db.commit()

    # Issue new token
    token = create_access_token(new_username)

    # Set new token in cookie for SPA
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        samesite="lax",
        secure=False,
    )

    logger.info("User '%s' changed username to '%s'", user, new_username)

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


from fastapi import Body


@api_router.post("/study_session")
def log_study_session(
    data: dict = Body(...),
    request: Request = None,
    db: Session = Depends(get_db),
):
    """
    Logs a study session and awards points
    Also updates challenge progress automatically
    """
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    minutes = data.get("duration_minutes", 0)
    if minutes <= 0:
        raise HTTPException(status_code=400, detail="Invalid duration")

    # Add session
    session = StudySessionTable(
        user_id=db_user.id,
        duration_minutes=minutes,
        started_at=datetime.utcnow() - timedelta(minutes=minutes),
        ended_at=datetime.utcnow(),
    )
    db.add(session)

    # Update total minutes
    db_user.total_study_minutes = (db_user.total_study_minutes or 0) + minutes

    # Award points (⭐ for every 5 minutes)
    stars_earned = minutes // 5
    db_user.points = (db_user.points or 0) + stars_earned

    # Update streak
    today = datetime.utcnow().date()
    last_date = (
        datetime.strptime(db_user.last_study_date, "%Y-%m-%d").date()
        if db_user.last_study_date
        else None
    )
    if last_date == today - timedelta(days=1):
        db_user.current_streak = (db_user.current_streak or 0) + 1
    elif last_date != today:
        db_user.current_streak = 1
    db_user.last_study_date = today.isoformat()

    # Update challenge progress for challenges user is participating in
    challenge_updates = []
    if hasattr(db_user, "challenges") and db_user.challenges:
        for challenge in db_user.challenges:
            progress_added = 0

            if challenge.unit == "minutes":
                # For challenges like "Study 5 Hours" (300 minutes)
                progress_added = minutes
                challenge.progress = min(
                    challenge.progress + progress_added, challenge.total
                )
                challenge_updates.append(
                    f"{challenge.title}: +{progress_added} minutes"
                )

            elif challenge.unit == "sessions":
                # For challenges like "Weekly Marathon" or "Night Owl Challenge"
                progress_added = 1
                challenge.progress = min(
                    challenge.progress + progress_added, challenge.total
                )
                challenge_updates.append(f"{challenge.title}: +1 session")

            elif challenge.unit == "points":
                # For challenges like "Point Collector"
                progress_added = stars_earned
                challenge.progress = min(
                    challenge.progress + progress_added, challenge.total
                )
                challenge_updates.append(f"{challenge.title}: +{progress_added} points")

            # Check if challenge is completed
            if challenge.progress >= challenge.total:
                # Award challenge reward
                db_user.points += challenge.reward
                challenge_updates.append(
                    f"🎉 {challenge.title} COMPLETED! +{challenge.reward} bonus points!"
                )

    db.commit()

    logger.info(
        "User '%s' logged a study session: %d min, earned %d ⭐, total points: %d. Challenge updates: %s",
        db_user.username,
        minutes,
        stars_earned,
        db_user.points,
        ", ".join(challenge_updates) if challenge_updates else "None",
    )

    return {
        "message": f"Study session logged: {minutes} min, {stars_earned} ⭐ earned",
        "minutes": minutes,
        "stars_earned": stars_earned,
        "total_points": db_user.points,
        "challenge_updates": challenge_updates,
    }


@api_router.get("/rewards")
def get_rewards(db: Session = Depends(get_db)):
    rewards = db.query(Reward).all()
    return_rewards = [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "cost": r.cost,
            "icon": r.icon,
            "color": r.color,
            "available": r.available,
        }
        for r in rewards
    ]
    print(return_rewards)
    return return_rewards


@api_router.get("/rewards/history")
def get_purchase_history(request: Request, db: Session = Depends(get_db)):
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    purchases = (
        db.query(RewardPurchase)
        .filter_by(user_id=db_user.id)
        .order_by(RewardPurchase.purchased_at.desc())
        .all()
    )

    return [
        {
            "item": db.query(Reward).filter_by(id=p.reward_id).first().name,
            "date": p.purchased_at.strftime("%Y-%m-%d"),
            "points": p.points_spent,
        }
        for p in purchases
    ]


@api_router.post("/rewards/purchase/{reward_id}")
def purchase_reward(reward_id: int, request: Request, db: Session = Depends(get_db)):
    user = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user).first()
    reward = db.query(Reward).filter_by(id=reward_id).first()

    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if db_user.points < reward.cost:
        raise HTTPException(status_code=400, detail="Not enough points")
    if reward.available <= 0:
        raise HTTPException(status_code=400, detail="Reward out of stock")

    db_user.points -= reward.cost
    reward.available -= 1

    # Mystery Box logic
    bonus_message = ""
    if reward.name.lower() == "mystery box":
        if random.random() < 0.5:
            stars = random.randint(1, 10)
            db_user.points += stars
            bonus_message = f" + {stars} bonus ⭐!"
        else:
            possible_rewards = (
                db.query(Reward).filter(Reward.name != "Mystery Box").all()
            )
            if possible_rewards:
                random_reward = random.choice(possible_rewards)
                bonus_message = f" + won a random reward: {random_reward.name}!"

    purchase = RewardPurchase(
        user_id=db_user.id, reward_id=reward.id, points_spent=reward.cost
    )

    db.add(purchase)
    db.commit()
    db.refresh(purchase)  # ensure purchase.id is available
    purchase_logger.info(
        f"Purchased '{reward.name}' for {reward.cost} points{bonus_message}",
        extra={"username": db_user.username, "purchase_id": purchase.id},
    )

    logger.info(
        "User '%s' purchased '%s'%s, new points: %d",
        db_user.username,
        reward.name,
        bonus_message,
        db_user.points,
    )

    # Send email
    try:
        send_purchase_email(
            to_email=db_user.email,
            username=db_user.username,
            reward_name=reward.name,
            purchase_id=purchase.id,
        )
    except Exception as e:
        logger.error("Failed to send email for purchase #%s: %s", purchase.id, str(e))

    return {
        "message": f"You purchased {reward.name}!{bonus_message}",
        "new_points": db_user.points,
    }


@api_router.get("/theme")
def get_user_theme(request: Request, db: Session = Depends(get_db)):
    user_name = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user_name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"theme": db_user.theme}


# POST to set user theme
@api_router.post("/theme")
def set_user_theme(
    data: dict = Body(...), request: Request = None, db: Session = Depends(get_db)
):
    """
    Sets a user's theme.
    """
    user_name = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user_name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    theme = data.get("theme", "cyber")
    db_user.theme = theme
    db.commit()
    return {"message": f"Theme set to {theme}", "theme": theme}


import os

if ".env" in os.listdir():
    from dotenv import load_dotenv

    load_dotenv()  # loads variables from .env

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


import smtplib
from email.message import EmailMessage


def send_purchase_email(
    to_email: str,
    username: str,
    reward_name: str,
    purchase_id: int,
    bonus_message: str = "",
):
    """Send purchase confirmation to user."""
    msg = EmailMessage()
    msg["Subject"] = f"Reward Purchase Confirmation: {reward_name}"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    body = (
        f"Hello {username},\n\n"
        f"You successfully purchased the reward: {reward_name}.\n"
        f"Purchase ID: {purchase_id}\n"
        f"{bonus_message}\n\n"
        "Thank you for using Lockin!\n"
    )
    msg.set_content(body)

    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)


@api_router.get("/community/activity")
def community_activity(db: Session = Depends(get_db)):
    """
    Returns real recent activity feed based on:
    - Casino jackpots (3 matching slots)
    - Completed study sessions
    - Streaks >= 3 days
    """
    activity = []

    jackpot_spins = db.execute(
        text(
            """
        SELECT u.username, cs.created_at, cs.result_slots, cs.win_amount
        FROM casino_spins cs
        JOIN users u ON u.id = cs.user_id
        WHERE cs.win_amount > 0
        ORDER BY cs.created_at DESC
        LIMIT 20
    """
        )
    ).fetchall()

    for row in jackpot_spins:
        try:
            slots = json.loads(row[2])
            if slots[0] == slots[1] == slots[2]:
                event_type = "jackpot"
                action = f"hit a JACKPOT on the slot machine! (+{row[3]} ⭐)"
            else:
                event_type = "achievement"
                action = f"won {row[3]} ⭐ in Lucky Charm!"
            activity.append(
                {
                    "user": row[0],
                    "action": action,
                    "type": event_type,
                    "created_at": row[1],
                }
            )
        except Exception:
            pass

    sessions = db.execute(
        text(
            """
        SELECT u.username, ss.ended_at, ss.duration_minutes, u.current_streak
        FROM study_sessions ss
        JOIN users u ON u.id = ss.user_id
        WHERE ss.ended_at IS NOT NULL
        ORDER BY ss.ended_at DESC
        LIMIT 20
    """
        )
    ).fetchall()

    for row in sessions:
        username, ended_at, duration, streak = row
        if streak and streak >= 3:
            activity.append(
                {
                    "user": username,
                    "action": f"is on a 🔥 {streak}-day study streak!",
                    "type": "achievement",
                    "created_at": ended_at,
                }
            )
        else:
            activity.append(
                {
                    "user": username,
                    "action": f"completed a {duration}-minute study session!",
                    "type": "session",
                    "created_at": ended_at,
                }
            )

    def parse_dt(item):
        val = item["created_at"]
        if val is None:
            return datetime.min
        if isinstance(val, str):
            try:
                return datetime.fromisoformat(val)
            except Exception:
                return datetime.min
        return val

    activity.sort(key=parse_dt, reverse=True)
    activity = activity[:15]

    now = datetime.utcnow()
    result = []
    avatars = ["🧑‍💻", "👩‍🎓", "👨‍💼", "👩‍🔬", "👨‍🎨", "👩‍💻", "🧑‍🎓", "👨‍🔬", "👩‍🎨", "🧑‍💼"]
    for i, item in enumerate(activity):
        dt = parse_dt(item)
        diff = now - dt
        minutes_ago = int(diff.total_seconds() / 60)
        if minutes_ago < 1:
            time_str = "just now"
        elif minutes_ago < 60:
            time_str = f"{minutes_ago}m ago"
        else:
            time_str = f"{minutes_ago // 60}h ago"

        result.append(
            {
                "user": item["user"],
                "action": item["action"],
                "type": item["type"],
                "time": time_str,
                "avatar": avatars[i % len(avatars)],
            }
        )

    return {"activity": result}


# FastAPI endpoint
@api_router.get("/community/groups")
def get_study_groups(db: Session = Depends(get_db), request: Request = None):
    user_name = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user_name).first()

    groups = db.query(StudyGroup).all()

    return {
        "groups": [
            {
                "id": g.id,
                "name": g.name,
                "subject": g.subject,
                "members": g.members,
                "active": g.active,
                "color": g.color,
                "emoji": g.emoji,
                "userIsMember": True if db_user.group_id == g.id else False,
            }
            for g in groups
        ]
    }


# Join a group
@api_router.post("/community/groups/join")
def join_group(
    data: dict = Body(...), request: Request = None, db: Session = Depends(get_db)
):
    """
    Join a study group.
    Request body: {"group_id": 1}
    """
    user_name = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user_name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    group_id = data.get("group_id")
    db_group = db.query(StudyGroup).filter_by(id=group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    if db_user.group_id == group_id:
        raise HTTPException(status_code=400, detail="You are already in this group")

    if db_user.group_id is not None:
        raise HTTPException(status_code=400, detail="You are already in another group")

    group = db.query(StudyGroup).filter_by(id=group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # If user is already in a group, decrement previous group's member count
    if db_user.group_id and db_user.group_id != db_group.id:
        old_group = db.query(StudyGroup).filter_by(id=db_user.group_id).first()
        if old_group:
            old_group.members = max(old_group.members - 1, 0)

    # Join new group
    db_user.group_id = db_group.id
    db_group.members = (db_group.members or 0) + 1

    db.commit()

    return {
        "message": f"Joined group {db_group.name}",
        "group_id": db_group.id,
        "group_name": db_group.name,
    }


# Leave a group
@api_router.post("/community/groups/leave")
def leave_group(request: Request = None, db: Session = Depends(get_db)):
    """
    Leave the current study group
    """
    user_name = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=user_name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not db_user.group_id:
        raise HTTPException(status_code=400, detail="User is not in any group")

    print(db_user.group_id)
    db_group = db.query(StudyGroup).filter_by(id=db_user.group_id).first()
    if db_group:
        db_group.members = max(db_group.members - 1, 0)

    db_user.group_id = None
    db.commit()

    return {"message": f"Left group {db_group.name if db_group else 'unknown'}"}


# ---------------------------
# CHALLENGES API
# ---------------------------


@api_router.get("/community/challenges")
def get_challenges(db: Session = Depends(get_db), request: Request = None):
    """
    List all challenges, including whether the current user is participating in each one.
    Returns a JSON object: { "challenges": [ ... ] }
    """
    # Get current user from cookie
    username = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=username).first() if username else None

    challenges = db.query(Challenge).all()
    challenges_list = []

    for challenge in challenges:
        # Determine if current user is participating
        user_is_participant = False
        if db_user and hasattr(db_user, "challenges") and db_user.challenges:
            user_is_participant = challenge in db_user.challenges

        challenges_list.append(
            {
                "id": challenge.id,
                "title": challenge.title,
                "description": challenge.description,
                "progress": challenge.progress,
                "total": challenge.total,
                "reward": challenge.reward,
                "participants": challenge.participants,
                "timeLeft": challenge.time_left,
                "unit": challenge.unit,
                "icon": challenge.icon,
                "userIsParticipant": user_is_participant,
            }
        )

    return {"challenges": challenges_list}


@api_router.post("/community/challenges/progress")
def update_challenge_progress(
    data: ChallengeProgressUpdate, request: Request, db: Session = Depends(get_db)
):
    """Update a user’s progress in a challenge."""
    username = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=username).first()
    challenge = db.query(Challenge).filter_by(id=data.challenge_id).first()

    if not db_user or not challenge:
        raise HTTPException(status_code=404, detail="User or challenge not found")

    # Increase challenge progress
    challenge.progress = min(challenge.progress + data.progress, challenge.total)
    # Increment participants if this is first progress
    if challenge.progress == data.progress:
        challenge.participants += 1

    db.commit()
    return {
        "message": f"Progress updated for challenge '{challenge.title}'",
        "current_progress": challenge.progress,
        "total": challenge.total,
    }


@api_router.get("/community/challenges/{challenge_id}")
def get_challenge(challenge_id: int, db: Session = Depends(get_db)):
    """Get a single challenge by ID."""
    challenge = db.query(Challenge).filter_by(id=challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return ChallengeOut(
        id=challenge.id,
        title=challenge.title,
        description=challenge.description,
        progress=challenge.progress,
        total=challenge.total,
        reward=challenge.reward,
        participants=challenge.participants,
        timeLeft=challenge.time_left,
        unit=challenge.unit,
        icon=challenge.icon,
    )


@api_router.post("/community/challenges/join")
def join_challenge(data: dict, request: Request, db: Session = Depends(get_db)):
    """Add current user to a challenge"""
    challenge_id = data.get("challenge_id")
    username = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=username).first()
    challenge = db.query(Challenge).filter_by(id=challenge_id).first()

    if not db_user or not challenge:
        raise HTTPException(status_code=404, detail="User or challenge not found")

    if challenge not in db_user.challenges:
        db_user.challenges.append(challenge)
        challenge.participants += 1
        db.commit()

    return {"message": f"Joined challenge '{challenge.title}'"}


@api_router.post("/community/challenges/leave")
def leave_challenge(data: dict, request: Request, db: Session = Depends(get_db)):
    """Remove current user from a challenge"""
    challenge_id = data.get("challenge_id")
    username = get_current_user_from_cookie(request)
    db_user = db.query(User).filter_by(username=username).first()
    challenge = db.query(Challenge).filter_by(id=challenge_id).first()

    if not db_user or not challenge:
        raise HTTPException(status_code=404, detail="User or challenge not found")

    if challenge in db_user.challenges:
        db_user.challenges.remove(challenge)
        challenge.participants = max(challenge.participants - 1, 0)
        db.commit()

    return {"message": f"Left challenge '{challenge.title}'"}


@app.get("/favicon.ico")
async def favicon():
    favicon_path = Path(__file__).parent / "frontend" / "assets" / "favicon.ico"
    if favicon_path.exists():
        return FileResponse(favicon_path)
    return {"detail": "Favicon not found"}


app.include_router(api_router)
