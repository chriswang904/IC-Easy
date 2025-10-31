from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from datetime import datetime
from database import Base
from sqlalchemy.orm import relationship
import json


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
    google_access_token = Column(Text, nullable=True)  # ← Changed to Text (longer)
    google_refresh_token = Column(Text, nullable=True)  # ← Changed to Text (longer)
    google_token_expiry = Column(DateTime, nullable=True)
    login_method = Column(String, default="email")  # "email" or "google"

    avatar_url = Column(String, nullable=True)  # DiceBear Avatar
    interests = Column(Text, nullable=True)  # ← Changed from JSON to Text
    
    collections = relationship("Collection", back_populates="user")

    # Helper methods for interests (optional but useful)
    def get_interests(self):
        """Get interests as a Python list"""
        if self.interests:
            return json.loads(self.interests)
        return []
    
    def set_interests(self, interests_list):
        """Set interests from a Python list"""
        if interests_list:
            self.interests = json.dumps(interests_list)
        else:
            self.interests = None