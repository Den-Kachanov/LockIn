from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.core.security import decode_access_token
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="LockIn")
templates = Jinja2Templates(directory="app/templates")

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(users_router, prefix="/api/v1/users")

# Include static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# HTML pages
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
def reg_page(request: Request):
    return templates.TemplateResponse("registration.html", {"request": request})

def get_current_user(access_token: str = Cookie(default=None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_access_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"email": payload.get("sub")}

@app.get("/timer", response_class=HTMLResponse)
def timer_page(request: Request):
    access_token = request.cookies.get("access_token")
    try:
        user = get_current_user(access_token)
    except HTTPException:
        # Redirect unauthorized users to login page
        return RedirectResponse(url="/login")
    
    # If authenticated, render the timer page
    return templates.TemplateResponse("timer.html", {"request": request, "user": user})
