import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt
from pwdlib import PasswordHash

from .config import get_settings

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, encoded: str) -> bool:
    return password_hash.verify(password, encoded)

def create_access_token(user_id: UUID) -> str:
    now = datetime.now(UTC)
    return jwt.encode({"sub": str(user_id), "aud": "persona-web", "iat": now, "exp": now + timedelta(minutes=30)}, get_settings().jwt_secret, algorithm="HS256")

def decode_access_token(token: str) -> UUID:
    payload = jwt.decode(token, get_settings().jwt_secret, algorithms=["HS256"], audience="persona-web")
    return UUID(payload["sub"])

def csrf_token() -> str:
    return secrets.token_urlsafe(32)

def csrf_digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()
