# backend/api/collections.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user_model import User
from models.collection_model import Collection
from utils.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/collections", tags=["Collections"])

class CollectionCreate(BaseModel):
    paper_id: str  # doi or arxiv_id
    title: str
    authors: List[dict]  # [{"name": "...", "affiliation": "..."}]
    abstract: Optional[str] = None
    url: Optional[str] = None
    source: str  # arxiv, openalex, crossref
    journal: Optional[str] = None
    published_date: Optional[str] = None
    citation_count: Optional[int] = 0
    doi: Optional[str] = None
    subject_id: Optional[int] = None  # CollectionsPage's Subject ID
    tags: Optional[List[str]] = []
    notes: Optional[str] = None

class CollectionResponse(BaseModel):
    id: int
    paper_id: str
    title: str
    authors: List[dict]
    abstract: Optional[str]
    url: Optional[str]
    source: str
    journal: Optional[str]
    published_date: Optional[str]
    citation_count: int
    subject_id: Optional[int]
    tags: List[str]
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

@router.post("/", response_model=CollectionResponse)
def add_to_collection(
    data: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add to collection"""
    logger.info(f"[Collection] User {current_user.username} adding: {data.title}")
    
    # check save or not
    existing = db.query(Collection).filter(
        Collection.user_id == current_user.id,
        Collection.paper_id == data.paper_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Paper already collected")
    
    collection = Collection(
        user_id=current_user.id,
        paper_id=data.paper_id,
        title=data.title,
        authors=json.dumps(data.authors),
        abstract=data.abstract,
        url=data.url,
        source=data.source,
        journal=data.journal,
        published_date=data.published_date,
        citation_count=data.citation_count,
        doi=data.doi,
        subject_id=data.subject_id,
        tags=json.dumps(data.tags),
        notes=data.notes
    )
    
    db.add(collection)
    db.commit()
    db.refresh(collection)
    
    logger.info(f"[Collection] Added successfully: ID={collection.id}")
    return format_collection(collection)

@router.get("/", response_model=List[CollectionResponse])
def get_collections(
    subject_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users' collecitons"""
    query = db.query(Collection).filter(Collection.user_id == current_user.id)
    
    if subject_id is not None:
        query = query.filter(Collection.subject_id == subject_id)
    
    collections = query.order_by(Collection.created_at.desc()).all()
    return [format_collection(c) for c in collections]

@router.delete("/{collection_id}")
def remove_from_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    db.delete(collection)
    db.commit()
    
    return {"message": "Removed from collection"}

@router.get("/check/{paper_id:path}")
def check_collected(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check saved or not"""
    exists = db.query(Collection).filter(
        Collection.user_id == current_user.id,
        Collection.paper_id == paper_id
    ).first() is not None
    
    return {"collected": exists}

@router.put("/{collection_id}")
def update_collection(
    collection_id: int,
    notes: Optional[str] = None,
    tags: Optional[List[str]] = None,
    subject_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    if notes is not None:
        collection.notes = notes
    if tags is not None:
        collection.tags = json.dumps(tags)
    if subject_id is not None:
        collection.subject_id = subject_id
    
    db.commit()
    db.refresh(collection)
    
    return format_collection(collection)

@router.post("/batch-delete")
def batch_delete(
    collection_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletion"""
    deleted = db.query(Collection).filter(
        Collection.id.in_(collection_ids),
        Collection.user_id == current_user.id
    ).delete(synchronize_session=False)
    
    db.commit()
    return {"deleted": deleted}

def format_collection(collection: Collection) -> dict:
    return {
        "id": collection.id,
        "paper_id": collection.paper_id,
        "title": collection.title,
        "authors": json.loads(collection.authors) if collection.authors else [],
        "abstract": collection.abstract,
        "url": collection.url,
        "source": collection.source,
        "journal": collection.journal,
        "published_date": collection.published_date,
        "citation_count": collection.citation_count,
        "subject_id": collection.subject_id,
        "tags": json.loads(collection.tags) if collection.tags else [],
        "notes": collection.notes,
        "created_at": collection.created_at.isoformat()
    }