from pydantic import BaseModel, EmailStr, Field

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
