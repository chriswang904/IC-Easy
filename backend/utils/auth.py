from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from models.user_model import User
from typing import Optional
from database import get_db
import os

# Config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Encrypt Password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
optional_oauth2_scheme = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Validate Password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Encrypt Password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT token"""
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Current User"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")  
        
        print(f"[DEBUG] Token payload: {payload}")
        print(f"[DEBUG] User ID from token: {user_id_str}, type: {type(user_id_str)}")
        
        if user_id_str is None:
            raise credentials_exception
        
        user_id = int(user_id_str)
        
    except JWTError as e:
        print(f"[DEBUG] JWT Error: {e}")
        raise credentials_exception
    except ValueError as e:
        print(f"[DEBUG] Value Error: {e}")
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    
    print(f"[DEBUG] User query - ID: {user_id}, Found: {user.username if user else None}")
    
    if user is None:
        raise credentials_exception
    
    return user

# Guest Service
def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_oauth2_scheme), db: Session = Depends(get_db)):
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        
        if user_id_str is None:
            return None
        
        user_id = int(user_id_str)
            
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except (JWTError, ValueError):
        return None