from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, EmailStr, Field, HttpUrl, model_validator


class Link(BaseModel):
    label: str = Field(max_length=40)
    url: HttpUrl


class Basics(BaseModel):
    name: str = Field(default="", max_length=120)
    headline: str = Field(default="", max_length=160)
    email: EmailStr | None = None
    phone: str = Field(default="", max_length=40)
    location: str = Field(default="", max_length=120)
    summary: str = Field(default="", max_length=4000)
    links: list[Link] = Field(default_factory=list, max_length=12)


class SectionItem(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    order: int = Field(ge=0)
    title: str = Field(max_length=200)
    subtitle: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=8000)
    start_date: str = Field(default="", max_length=20)
    end_date: str = Field(default="", max_length=20)


class Section(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    kind: Literal["experience", "education", "skills", "projects", "certifications", "languages", "custom"]
    title: str = Field(max_length=80)
    order: int = Field(ge=0)
    visible: bool = True
    items: list[SectionItem] = Field(default_factory=list, max_length=100)


class Presentation(BaseModel):
    template: Literal["classic", "modern"] = "modern"
    font: Literal["sans", "serif"] = "sans"
    accent: str = Field(default="#176b5b", pattern=r"^#[0-9a-fA-F]{6}$")
    spacing: Literal["compact", "comfortable"] = "comfortable"


class ResumeDocument(BaseModel):
    schema_version: Literal[1] = 1
    basics: Basics = Field(default_factory=Basics)
    sections: list[Section] = Field(default_factory=list, max_length=30)
    presentation: Presentation = Field(default_factory=Presentation)

    @model_validator(mode="after")
    def unique_ids(self) -> "ResumeDocument":
        ids = [section.id for section in self.sections]
        if len(ids) != len(set(ids)):
            raise ValueError("section ids must be unique")
        if sorted(section.order for section in self.sections) != list(range(len(self.sections))):
            raise ValueError("section order must be contiguous")
        for section in self.sections:
            if sorted(item.order for item in section.items) != list(range(len(section.items))):
                raise ValueError("item order must be contiguous")
        return self


class ResumeCreate(BaseModel):
    title: str = Field(default="Untitled résumé", max_length=160)
    document: ResumeDocument = Field(default_factory=ResumeDocument)


class ResumeUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    document: ResumeDocument
    version: int = Field(ge=1)
