from pathlib import Path

# ---------------------------
# PATH RESOLUTION
# ---------------------------

BASE_DIR = Path(__file__).resolve().parent / "app"

PATHS = {
    "root": BASE_DIR,
    "frontend": BASE_DIR / "frontend",
    "db": BASE_DIR / "db",
    "secrets": BASE_DIR / "secrets",
    "security_pages" : BASE_DIR / "security_pages"
}


# ---------------------------
# LOAD CONFIG FILE (OPTIONAL)
# ---------------------------

if (path_to_secret := (BASE_DIR / "app" / "secrets"/ "secret_key")).exists():
    with open(path_to_secret, "r", encoding="utf-8") as f:
        SECRET_KEY = f.read()
else:
    SECRET_KEY = "SECRET_KEY"


# ---------------------------
# PROPERTIES OBJECT
# ---------------------------

properties = {
    "path": PATHS,
    "secret_key": SECRET_KEY,
}
