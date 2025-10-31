# backend/models/collection_model.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Paper info
    paper_id = Column(String(255), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    authors = Column(Text)  # JSON string
    abstract = Column(Text)
    url = Column(String(500))
    source = Column(String(50))  # arxiv, openalex, crossref
    journal = Column(String(200))
    published_date = Column(String(100))
    citation_count = Column(Integer, default=0)
    doi = Column(String(200))
    
    # Label 
    subject_id = Column(BigInteger, nullable=True)
    tags = Column(Text)  # JSON string
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # relationship
    user = relationship("User", back_populates="collections")