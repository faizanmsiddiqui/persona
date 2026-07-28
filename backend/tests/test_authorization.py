from uuid import uuid4
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.routers.resumes import owned
from app.main import app

def test_owned_hides_missing_or_foreign_resume() -> None:
    db = Mock()
    db.scalar.return_value = None
    user = Mock(id=uuid4())
    with pytest.raises(HTTPException) as error:
        owned(db, uuid4(), user)
    assert error.value.status_code == 404


def test_public_sharing_routes_are_not_exposed() -> None:
    paths = app.openapi()["paths"]
    assert not any("/share" in path or "/public/resumes" in path for path in paths)
