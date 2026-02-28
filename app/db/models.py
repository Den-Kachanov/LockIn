from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


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

    sessions = relationship("StudySession", back_populates="user")
    spins = relationship("CasinoSpin", back_populates="user")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")


class CasinoSpin(Base):
    __tablename__ = "casino_spins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bet_amount = Column(Integer, nullable=False)
    result_slots = Column(String, nullable=False)  # JSON "[0,3,5]"
    win_amount = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="spins")
