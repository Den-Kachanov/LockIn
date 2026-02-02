from app.core.security import decode_access_token
from fastapi import APIRouter, Cookie, Depends, HTTPException

router = APIRouter(tags=["users"])

def get_current_user(access_token: str = Cookie(default=None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_access_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    email = payload.get("sub")
    return {"email": email}

@router.get("/me")
def read_me(user=Depends(get_current_user)):
    return user
