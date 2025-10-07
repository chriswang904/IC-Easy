# backend/services/history_service.py
from sqlalchemy.orm import Session
from models.history_model import SearchHistory
from datetime import datetime, timedelta
from collections import Counter

class HistoryService:
    """Manage user search history"""

    def __init__(self, db: Session):
        self.db = db

    def log_search(self, keyword: str, source: str, total_results: int, user_id: int = None):
        """Record a search event"""
        new_entry = SearchHistory(
            keyword=keyword,
            source=source,
            total_results=total_results,
            timestamp=datetime.utcnow(),
            user_id=user_id
        )
        self.db.add(new_entry)
        self.db.commit()
        self.db.refresh(new_entry)
        return new_entry

    def get_history(self, limit: int = 20, user_id: int = None):
        """Fetch recent search history"""
        query = self.db.query(SearchHistory)

        # If provided user_id, return user's history
        if user_id is not None:
            query = query.filter(SearchHistory.user_id == user_id)
        
        return (
            query
            .order_by(SearchHistory.timestamp.desc())
            .limit(limit)
            .all()
        )


    def get_trending_keywords(self, days: int = 7, top_k: int = 10, user_id: int = None):
        """Optimized trending keyword calculation with SQL grouping"""
        from datetime import timedelta
        from sqlalchemy import func
        
        cutoff = datetime.utcnow() - timedelta(days=days)

        query = (
            self.db.query(
                SearchHistory.keyword,
                func.count(SearchHistory.keyword).label('count')
            )
            .filter(SearchHistory.timestamp >= cutoff)
        )

        # Filter user's history
        if user_id is not None:
            query = query.filter(SearchHistory.user_id == user_id)
        
        results = (
            query
            .group_by(SearchHistory.keyword)
            .order_by(func.count(SearchHistory.keyword).desc())
            .limit(top_k)
            .all()
        )
        
        return [{"keyword": k, "count": c} for k, c in results]
    
    def cleanup_old_records(self, days: int = 30, user_id: int = None):
        """Delete records older than specified days"""

        cutoff = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(SearchHistory).filter(SearchHistory.timestamp < cutoff)
        
        if user_id is not None:
            query = query.filter(SearchHistory.user_id == user_id)
        
        deleted = query.delete()
        self.db.commit()
        return deleted