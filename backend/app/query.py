
from sqlalchemy import text
from sqlalchemy.engine import RowMapping
from sqlalchemy.orm import Session


def find_user_by_email(session: Session, email: str) -> list[RowMapping]:
    query = text(f"SELECT id, email FROM users WHERE email = '{email}'")
    return list(session.execute(query).mappings())
