from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Document, DocumentShare, User
from schemas.share import ShareCreate, ShareResponse


router = APIRouter(
    prefix="/documents",
    tags=["Sharing"],
)


@router.post(
    "/{document_id}/shares",
    response_model=ShareResponse,
    status_code=201,
)
def share_document(
    document_id: int,
    payload: ShareCreate,
    user_id: int,
    db: Session = Depends(get_db),
):
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

    recipient = (
        db.query(User)
        .filter(User.id == payload.user_id)
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="User to share with not found",
        )

    if recipient.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot share a document with yourself",
        )

    existing_share = (
        db.query(DocumentShare)
        .filter(
            DocumentShare.document_id == document_id,
            DocumentShare.user_id == recipient.id,
        )
        .first()
    )

    if existing_share:
        raise HTTPException(
            status_code=400,
            detail="Document is already shared with this user",
        )

    share = DocumentShare(
        document_id=document_id,
        user_id=recipient.id,
    )

    db.add(share)
    db.commit()
    db.refresh(share)

    return share


@router.get(
    "/{document_id}/shares",
    response_model=list[ShareResponse],
)
def get_document_shares(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
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

    return (
        db.query(DocumentShare)
        .filter(DocumentShare.document_id == document_id)
        .all()
    )