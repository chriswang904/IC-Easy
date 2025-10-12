from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Google OAuth
    google_id = Column(String, unique=True, nullable=True, index=True)
    google_access_token = Column(String, nullable=True)
    google_refresh_token = Column(String, nullable=True)
    google_token_expiry = Column(DateTime, nullable=True)
    login_method = Column(String, default="email")  # "email" or "google"

    avatar_url = Column(String, nullable=True)  # DiceBear Avatar
    interests = Column(JSON, nullable=True)     # Users' Interests