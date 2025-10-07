# models/history_model.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base  

class SearchHistory(Base):
    """Database model for storing user search history."""

    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False, index=True)  
    source = Column(String, default="all")
    total_results = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True) 
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)