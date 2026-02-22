# ==============================
# main.py
# ==============================

from datetime import datetime, timedelta
from pathlib import Path

# -----------------------------
# CONFIG
# -----------------------------
from config import properties
from fastapi import (APIRouter, Depends, FastAPI, HTTPException, Request,
                     Response)
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from starlette.middleware.base import BaseHTTPMiddleware

from .db.database import get_db
from .db.schemas import StatsResponse, TokenResponse, UserLogin, UserRegister
from .middleware.logging import LoggingMiddleware

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


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)  # new
    password_hash = Column(String, nullable=False)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)

# -----------------------------
# SECURITY (JWT + hashing)
# -----------------------------
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str):
    print(len(password))
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


def create_access_token(username: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
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
    return SECURITY_PAGES / "login.html"


@app.get("/register", response_class=FileResponse)
async def register_page():
    return SECURITY_PAGES / "register.html"


# -----------------------------
# ROOT REDIRECT
# -----------------------------
@app.get("/")
async def root(request: Request):
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
    # check username
    if db.query(User).filter_by(username=data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(
        username=data.username,
        email=data.email,         # save email
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()

    return {"message": "Registered successfully"}



@api_router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
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
    return StatsResponse(user=user, progress=0)


app.include_router(api_router)
