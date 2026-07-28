from uuid import uuid4
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.routers.resumes import owned

def test_owned_hides_missing_or_foreign_resume() -> None:
    db = Mock()
    db.scalar.return_value = None
    user = Mock(id=uuid4())
    with pytest.raises(HTTPException) as error:
        owned(db, uuid4(), user)
    assert error.value.status_code == 404
