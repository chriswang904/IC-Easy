# backend/api/history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.history_service import HistoryService
from models.history_model import SearchHistory
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/history", tags=["History"])

class SearchHistoryResponse(BaseModel):
    id: int
    keyword: str
    source: str
    total_results: int
    timestamp: str


@router.get("/", response_model=List[SearchHistoryResponse])
def get_recent_history(limit: int = 20, db: Session = Depends(get_db)):
    """Fetch recent search history"""
    service = HistoryService(db)
    history = service.get_history(limit)
    return [
        {
            "id": h.id,
            "keyword": h.keyword,
            "source": h.source,
            "total_results": h.total_results,
            "timestamp": h.timestamp.isoformat()
        }
        for h in history
    ]

class TrendingKeywordResponse(BaseModel):
    keyword: str
    count: int

@router.get("/trending", response_model=List[TrendingKeywordResponse])
def get_trending_keywords(days: int = 7, top_k: int = 10, db: Session = Depends(get_db)):
    """Return trending keywords in recent days"""
    service = HistoryService(db)
    return service.get_trending_keywords(days, top_k)

@router.delete("/cleanup")
def cleanup_old_history(days: int = 30, db: Session = Depends(get_db)):
    """Delete search history older than specified days"""
    service = HistoryService(db)
    deleted = service.cleanup_old_records(days)
    return {"message": f"Deleted {deleted} old records", "days": days}