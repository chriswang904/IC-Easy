# models/history_model.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from database import Base  

class SearchHistory(Base):
    """Database model for storing user search history."""

    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False, index=True)  
    source = Column(String, default="all")
    total_results = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True) 
    user_id = Column(String, nullable=True, index=True) 