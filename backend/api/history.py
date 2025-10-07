# backend/api/history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.history_service import HistoryService
from models.history_model import SearchHistory
from typing import List, Optional
from pydantic import BaseModel
from utils.auth import get_current_user_optional
from models.user_model import User

router = APIRouter(prefix="/api/history", tags=["History"])

class SearchHistoryResponse(BaseModel):
    id: int
    keyword: str
    source: str
    total_results: int
    timestamp: str


@router.get("/", response_model=List[SearchHistoryResponse])
def get_recent_history(limit: int = 20, current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Fetch recent search history"""
    service = HistoryService(db)

    # Fetch research history
    # If logged in, return users' history
    # If not, return none
    service = HistoryService(db)
    user_id = current_user.id if current_user else None
    history = service.get_history(limit, user_id=user_id)
    
    return [
        SearchHistoryResponse(
            id=h.id,
            keyword=h.keyword,
            source=h.source,
            total_results=h.total_results,
            timestamp=h.timestamp.isoformat()
        )
        for h in history
    ]

class TrendingKeywordResponse(BaseModel):
    keyword: str
    count: int

@router.get("/trending", response_model=List[TrendingKeywordResponse])
def get_trending_keywords(days: int = 7, top_k: int = 10, current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Return trending keywords in recent days"""
    service = HistoryService(db)
    user_id = current_user.id if current_user else None
    return service.get_trending_keywords(days, top_k, user_id=user_id)

def cleanup_old_history(days: int = 30, current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Delete search history older than specified days"""
    # Clean old history 
    service = HistoryService(db)
    user_id = current_user.id if current_user else None
    deleted = service.cleanup_old_records(days)
    return {"message": f"Deleted {deleted} old records", "days": days}