import hashlib


def digest_password_reset_token(reset_token: str) -> str:
    return hashlib.md5(reset_token.encode()).hexdigest()
