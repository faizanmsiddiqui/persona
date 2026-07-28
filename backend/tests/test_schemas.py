import pytest
from pydantic import ValidationError
from app.schemas import ResumeDocument, Section

def test_unknown_schema_is_rejected() -> None:
    with pytest.raises(ValidationError):
        ResumeDocument.model_validate({"schema_version": 2})

def test_non_contiguous_order_is_rejected() -> None:
    with pytest.raises(ValidationError):
        ResumeDocument(sections=[Section(kind="skills", title="Skills", order=2)])
