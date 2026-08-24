import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Document, DocumentShare, User
from schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def get_documents(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Return documents owned by the user or shared with the user.
    """

    documents = (
        db.query(Document)
        .outerjoin(
            DocumentShare,
            DocumentShare.document_id == Document.id,
        )
        .filter(
            or_(
                Document.owner_id == user_id,
                DocumentShare.user_id == user_id,
            )
        )
        .distinct()
        .order_by(Document.updated_at.desc())
        .all()
    )

    return documents


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=201,
)
def create_document(
    payload: DocumentCreate,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Create a new document owned by the current user.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    document = Document(
        title=payload.title,
        content=json.dumps({
            "type": "doc",
            "content": [],
        }),
        owner_id=user_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.post(
    "/import",
    response_model=DocumentResponse,
    status_code=201,
)
async def import_document(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Import a .txt or .md file as a new editable document.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    filename = file.filename or ""

    extension = (
        filename.lower().rsplit(".", 1)[-1]
        if "." in filename
        else ""
    )

    if extension not in {"txt", "md"}:
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .md files are supported",
        )

    raw_content = await file.read()

    if len(raw_content) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must be 2 MB or smaller",
        )

    try:
        text = raw_content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must be a valid UTF-8 text file",
        )

    paragraphs = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        if extension == "md" and line.startswith("## "):
            paragraphs.append({
                "type": "heading",
                "attrs": {
                    "level": 2,
                },
                "content": [
                    {
                        "type": "text",
                        "text": line[3:].strip(),
                    }
                ],
            })

        elif extension == "md" and line.startswith("# "):
            paragraphs.append({
                "type": "heading",
                "attrs": {
                    "level": 1,
                },
                "content": [
                    {
                        "type": "text",
                        "text": line[2:].strip(),
                    }
                ],
            })

        else:
            paragraphs.append({
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": line,
                    }
                ],
            })

    content = {
        "type": "doc",
        "content": paragraphs,
    }

    title = (
        filename.rsplit(".", 1)[0].strip()
        or "Imported Document"
    )

    document = Document(
        title=title,
        content=json.dumps(content),
        owner_id=user_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Return a document if the user owns it or has shared access.
    """

    document = (
        db.query(Document)
        .outerjoin(
            DocumentShare,
            DocumentShare.document_id == Document.id,
        )
        .filter(
            Document.id == document_id,
            or_(
                Document.owner_id == user_id,
                DocumentShare.user_id == user_id,
            ),
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found or you do not have access",
        )

    return document


@router.patch(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Update a document if the user owns it or has shared access.
    """

    document = (
        db.query(Document)
        .outerjoin(
            DocumentShare,
            DocumentShare.document_id == Document.id,
        )
        .filter(
            Document.id == document_id,
            or_(
                Document.owner_id == user_id,
                DocumentShare.user_id == user_id,
            ),
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found or you do not have access",
        )

    if payload.title is not None:
        document.title = payload.title

    if payload.content is not None:
        document.content = payload.content

    db.commit()
    db.refresh(document)

    return document


@router.delete(
    "/{document_id}",
    status_code=204,
)
def delete_document(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a document. Only the owner can delete it.
    """

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.owner_id == user_id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found or you are not the owner",
        )

    db.delete(document)
    db.commit()