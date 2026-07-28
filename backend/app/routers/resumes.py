from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import current_user, require_csrf
from ..models import Resume, ResumeVersion, User
from ..schemas import ResumeCreate, ResumeDocument, ResumeUpdate
from ..rendering import render_html, render_pdf
from ..sanitization import sanitize_document

router = APIRouter(prefix="/api/v1", tags=["resumes"])

def serialize(row: Resume) -> dict:
    return {
        "id": str(row.id),
        "title": row.title,
        "document": row.document,
        "updated_at": row.updated_at.isoformat(),
    }

def touch(row: Resume) -> None:
    row.updated_at = datetime.now(UTC)

def owned(db: Session, resume_id: UUID, user: User) -> Resume:
    row = db.scalar(select(Resume).where(Resume.id == resume_id, Resume.owner_id == user.id))
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Résumé not found")
    return row

@router.get("/resumes")
def list_resumes(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict]:
    return [serialize(row) for row in db.scalars(select(Resume).where(Resume.owner_id == user.id).order_by(Resume.updated_at.desc()))]

@router.post("/resumes", status_code=201, dependencies=[Depends(require_csrf)])
def create_resume(payload: ResumeCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    row = Resume(owner_id=user.id, title=payload.title, document=payload.document.model_dump(mode="json"))
    db.add(row); db.commit(); db.refresh(row)
    return serialize(row)

@router.get("/resumes/{resume_id}")
def get_resume(resume_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    return serialize(owned(db, resume_id, user))

@router.patch("/resumes/{resume_id}", dependencies=[Depends(require_csrf)])
def update_resume(resume_id: UUID, payload: ResumeUpdate, if_match: str | None = Header(default=None), user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    row = owned(db, resume_id, user)
    try:
        supplied_timestamp = datetime.fromisoformat(if_match.strip('"')) if if_match else payload.updated_at
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid save timestamp") from None
    if row.updated_at != supplied_timestamp:
        raise HTTPException(status.HTTP_409_CONFLICT, "Résumé changed in another session")
    db.add(ResumeVersion(resume_id=row.id, document=row.document))
    row.title = payload.title or row.title
    row.document = sanitize_document(payload.document.model_dump(mode="json"))
    touch(row)
    db.commit(); db.refresh(row)
    return serialize(row)

@router.delete("/resumes/{resume_id}", status_code=204, dependencies=[Depends(require_csrf)])
def delete_resume(resume_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Response:
    db.delete(owned(db, resume_id, user)); db.commit()
    return Response(status_code=204)

@router.post("/resumes/{resume_id}/duplicate", status_code=201, dependencies=[Depends(require_csrf)])
def duplicate_resume(resume_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    source = owned(db, resume_id, user)
    row = Resume(owner_id=user.id, title=f"{source.title} copy", document=source.document)
    db.add(row); db.commit(); db.refresh(row)
    return serialize(row)

@router.put("/resumes/{resume_id}/sections", dependencies=[Depends(require_csrf)])
def reorder_sections(resume_id: UUID, document: ResumeDocument, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    row = owned(db, resume_id, user)
    row.document = document.model_dump(mode="json"); touch(row); db.commit(); db.refresh(row)
    return serialize(row)

@router.get("/resumes/{resume_id}/versions")
def versions(resume_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict]:
    row = owned(db, resume_id, user)
    query = select(ResumeVersion).where(ResumeVersion.resume_id == row.id).order_by(ResumeVersion.created_at.desc()).limit(50)
    return [{"id": str(v.id), "created_at": v.created_at} for v in db.scalars(query)]

@router.post("/resumes/{resume_id}/versions/{version_id}/restore", dependencies=[Depends(require_csrf)])
def restore(resume_id: UUID, version_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    row = owned(db, resume_id, user)
    old = db.scalar(select(ResumeVersion).where(ResumeVersion.id == version_id, ResumeVersion.resume_id == row.id))
    if not old: raise HTTPException(404, "Version not found")
    row.document = old.document; touch(row); db.commit(); db.refresh(row)
    return serialize(row)

@router.get("/templates")
def templates() -> list[dict[str, str]]:
    return [
        {"id": "modern", "name": "Modern", "description": "Editorial layout with a strong accent"},
        {"id": "classic", "name": "Classic", "description": "Traditional single-column typography"},
    ]

@router.get("/resumes/{resume_id}/preview", response_class=Response)
def preview(resume_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Response:
    row = owned(db, resume_id, user)
    return Response(render_html(row.document), media_type="text/html")

@router.post("/resumes/{resume_id}/pdf", dependencies=[Depends(require_csrf)])
def pdf(resume_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Response:
    row = owned(db, resume_id, user)
    return Response(render_pdf(row.document), media_type="application/pdf", headers={"Content-Disposition": 'attachment; filename="resume.pdf"'})
