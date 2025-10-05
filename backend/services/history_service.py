# backend/services/history_service.py
from sqlalchemy.orm import Session
from models.history_model import SearchHistory
from datetime import datetime
from collections import Counter

class HistoryService:
    """Manage user search history"""

    def __init__(self, db: Session):
        self.db = db

    def log_search(self, keyword: str, source: str, total_results: int, user_id: str = None):
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

    def get_history(self, limit: int = 20):
        """Fetch recent search history"""
        return (
            self.db.query(SearchHistory)
            .order_by(SearchHistory.timestamp.desc())
            .limit(limit)
            .all()
        )

    def get_trending_keywords(self, days: int = 7, top_k: int = 10):
        """Optimized trending keyword calculation with SQL grouping"""
        from datetime import timedelta
        from sqlalchemy import func
        
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Use SQL GROUP BY instead of Python Counter for better performance
        results = (
            self.db.query(
                SearchHistory.keyword,
                func.count(SearchHistory.keyword).label('count')
            )
            .filter(SearchHistory.timestamp >= cutoff)
            .group_by(SearchHistory.keyword)
            .order_by(func.count(SearchHistory.keyword).desc())
            .limit(top_k)
            .all()
        )
        
        return [{"keyword": k, "count": c} for k, c in results]
    def cleanup_old_records(self, days: int = 30):
        """Delete records older than specified days"""
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        deleted = (
            self.db.query(SearchHistory)
            .filter(SearchHistory.timestamp < cutoff)
            .delete()
        )
        self.db.commit()
        return deleted