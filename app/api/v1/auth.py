from datetime import timedelta

from app.core.security import create_access_token
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

    def __repr__(self):
        return f"LoginRequest({self.email}, {self.password})"

    def __str__(self):
        return f"LoginRequest({self.email}, {len(self.password)*'*'})"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    def __repr__(self):
        return f"RegisterRequest({self.name}, {self.email}, {self.password})"

    def __str__(self):
        return f"RegisterRequest({self.name}, {self.email}, {len(self.password)*'*'})"


@router.post("/login")
def login(data: LoginRequest, response: Response):
    # MOCK user check; replace with DB in future
    if data.email == "test@example.com" and data.password == "1234":
        token = create_access_token({"sub": data.email}, expires_delta=timedelta(days=7))
        # Set JWT in httpOnly cookie
        response.set_cookie(key="access_token", value=token, httponly=True, max_age=604800)
        return {"msg": "Logged in"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/register")
def register(data: RegisterRequest):
    # Mock: just accept any data for now
    print(f"New user: {data.name}, {data.email}")
    return {"msg": "Registered successfully"}

@router.post("/logout")
def logout(response: Response):
    # Overwrite the cookie with empty value and expired date
    response.delete_cookie(key="access_token", path="/")
    return {"msg": "Logged out"}
