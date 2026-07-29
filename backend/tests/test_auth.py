from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.dependencies import require_logout_csrf
from app.security import create_access_token, decode_access_token, hash_password, verify_password

def test_password_round_trip() -> None:
    encoded = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", encoded)
    assert not verify_password("wrong password", encoded)

def test_token_round_trip() -> None:
    user_id = uuid4()
    assert decode_access_token(create_access_token(user_id)) == user_id


def test_logout_allows_an_expired_session_without_csrf() -> None:
    require_logout_csrf(None, None, None)


def test_logout_requires_csrf_for_an_active_session() -> None:
    with pytest.raises(HTTPException) as error:
        require_logout_csrf("access-token", None, None)

    assert error.value.status_code == 403


def test_logout_accepts_matching_csrf_for_an_active_session() -> None:
    require_logout_csrf("access-token", "csrf-token", "csrf-token")
