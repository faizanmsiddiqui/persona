from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import current_user, require_csrf
from ..models import User

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

class Profile(BaseModel):
    email: str
    display_name: str

class ProfileUpdate(BaseModel):
    display_name: str = Field(max_length=120)

@router.get("", response_model=Profile)
def get_profile(user: User = Depends(current_user)) -> Profile:
    return Profile(email=user.email, display_name=user.display_name)

@router.patch("", response_model=Profile, dependencies=[Depends(require_csrf)])
def update_profile(payload: ProfileUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Profile:
    user.display_name = payload.display_name.strip()
    db.commit()
    return Profile(email=user.email, display_name=user.display_name)
