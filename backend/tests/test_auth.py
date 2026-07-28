from uuid import uuid4

from app.security import create_access_token, decode_access_token, hash_password, verify_password

def test_password_round_trip() -> None:
    encoded = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", encoded)
    assert not verify_password("wrong password", encoded)

def test_token_round_trip() -> None:
    user_id = uuid4()
    assert decode_access_token(create_access_token(user_id)) == user_id
