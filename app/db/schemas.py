from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# ---------------------------
# AUTH INPUTS
# ---------------------------

class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)


class UserLogin(BaseModel):
    username: str
    password: str


# ---------------------------
# AUTH OUTPUTS
# ---------------------------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    username: str


# ---------------------------
# APP DATA
# ---------------------------

class StatsResponse(BaseModel):
    user: str
    progress: int


# ---------------------------
# DASHBOARD DATA
# ---------------------------

class UserStats(BaseModel):
    username: str
    total_study_minutes: int
    sessions_today: int
    current_streak: int
    points: int
    weekly_minutes: int
    weekly_goal_minutes: int = 2400  # 40 hours


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    total_study_minutes: int


class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    my_rank: int
    my_study_minutes: int


# ---------------------------
# CASINO
# ---------------------------

class CasinoSpinRequest(BaseModel):
    bet_amount: int = Field(ge=10, le=500)
    machine_id: int = Field(ge=1, le=3)


class CasinoSpinResponse(BaseModel):
    slots: List[int]  # [0-9, 0-9, 0-9]
    win_amount: int
    is_jackpot: bool
    is_double: bool
    new_balance: int


class CasinoStatsResponse(BaseModel):
    total_points: int
    total_winnings: int
    spins_today: int
    win_rate: float
