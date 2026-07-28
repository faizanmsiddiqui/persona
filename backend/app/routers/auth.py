from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..dependencies import current_user, require_csrf
from ..models import User
from ..security import create_access_token, csrf_token, hash_password, verify_password

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

class UserView(BaseModel):
    id: str
    email: EmailStr
    display_name: str

def view(user: User) -> UserView:
    return UserView(id=str(user.id), email=user.email, display_name=user.display_name)

def set_cookies(response: Response, user: User) -> None:
    secure = get_settings().cookie_secure
    common = {"secure": secure, "samesite": "lax", "max_age": 1800, "path": "/"}
    response.set_cookie("access_token", create_access_token(user.id), httponly=True, **common)
    response.set_cookie("csrf_token", csrf_token(), httponly=False, **common)

@router.post("/register", response_model=UserView, status_code=201)
def register(payload: Credentials, response: Response, db: Session = Depends(get_db)) -> UserView:
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user); db.commit()
    set_cookies(response, user)
    return view(user)

@router.post("/login", response_model=UserView)
def login(payload: Credentials, response: Response, db: Session = Depends(get_db)) -> UserView:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    set_cookies(response, user)
    return view(user)

@router.post("/logout", status_code=204, dependencies=[Depends(require_csrf)])
def logout(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("csrf_token", path="/")

@router.get("/me", response_model=UserView)
def me(user: User = Depends(current_user)) -> UserView:
    return view(user)
