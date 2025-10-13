# ./api/auth.py
import os
import secrets
import logging
import json
import urllib.parse
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from database import get_db, SessionLocal
from models.user_model import User
from utils.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)
from services.google_auth_service import GoogleAuthService

logger = logging.getLogger(__name__)
# router = APIRouter(prefix="/api/auth", tags=["Authentication"])
router = APIRouter(prefix="/api/auth", tags=["Auth"])

google_auth_service = GoogleAuthService()

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    interests: Optional[List[str]] = []
    avatar_url: Optional[str] = None

    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must be alphanumeric')
        if len(v) < 3 or len(v) > 20:
            raise ValueError('Username must be 3-20 characters')
        return v
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        # Truncate instead of raising error
        if len(v) > 72:
            v = v[:72]  # ← Just truncate it
        return v

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    avatar_url: Optional[str] = None
    interests: Optional[List[str]] = None

class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        logger.info(f"[Register] Starting registration for: {user_data.email}")
        
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        
        logger.info(f"[Register] Hashing password...")
        hashed_password = get_password_hash(user_data.password)
        
        logger.info(f"[Register] Creating user object...")
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            interests=json.dumps(user_data.interests) if user_data.interests else None,
            avatar_url=user_data.avatar_url
        )
        
        logger.info(f"[Register] Adding to database...")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"[Register] Creating access token...")
        access_token = create_access_token(data={"sub": new_user.id})
        
        logger.info(f"[Auth] New user registered: {new_user.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "username": new_user.username,
                "created_at": new_user.created_at.isoformat(),
                "avatar_url": new_user.avatar_url,
                "interests": json.loads(new_user.interests) if new_user.interests else [],
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Register] ERROR: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Handle login using OAuth2 form data (username + password)
    Returns complete user information including avatar_url and interests
    """
    logger.info(f"[Auth] Login attempt for: {form_data.username}")
    
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()

    # Validate user exists
    if not user:
        logger.warning(f"[Auth] User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Check if user has a password (not Google-only user)
    if not user.hashed_password:
        logger.warning(f"[Auth] User has no password (Google-only): {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google login. Please sign in with Google."
        )
    
    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"[Auth] Invalid password for: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    logger.info(f"[Auth] Login successful: {user.username}")
    
    # Return complete user information
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "avatar_url": user.avatar_url, 
            "interests": user.interests or [], 
            "login_method": user.login_method,
        },
        "avatar_url": user.avatar_url,  
        "interests": user.interests or []  
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        created_at=current_user.created_at.isoformat()
    )

@router.get("/health")
def auth_health():
    return {"status": "healthy", "service": "authentication"}

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login"""
    state = secrets.token_urlsafe(32)
    auth_url, _ = google_auth_service.get_authorization_url(state)
    return {"auth_url": auth_url, "state": state}

@router.get("/google/callback")
async def google_callback(code: str, state: str = None):
    """Handle Google OAuth callback"""
    db = SessionLocal()
    try:
        logger.info(f"[Google OAuth] === CALLBACK START ===")
        logger.info(f"[Google OAuth] Code received: {code[:30]}...")
        
        token_data = google_auth_service.exchange_code_for_token(code)
        user_info = token_data["user_info"]
        
        logger.info(f"[Google OAuth] User info received: {user_info}")
        
        user = db.query(User).filter(User.email == user_info["email"]).first()
        
        if not user:
            base_username = user_info["name"].replace(" ", "_").lower()
            username = base_username
            counter = 1
            
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}_{counter}"
                counter += 1
            
            logger.info(f"[Google OAuth] Creating new user: {username}")
            
            user = User(
                email=user_info["email"],
                username=username,
                google_id=user_info["google_id"],
                google_access_token=token_data["access_token"],
                google_refresh_token=token_data["refresh_token"],
                login_method="google",
                hashed_password=None
            )
            db.add(user)
        else:
            logger.info(f"[Google OAuth] Updating existing user: {user.username}")
            user.google_id = user_info["google_id"]
            user.google_access_token = token_data["access_token"]
            user.google_refresh_token = token_data["refresh_token"]
        
        db.commit()
        db.refresh(user)
        
        # Create token
        token_payload = {"sub": int(user.id)}
        access_token = create_access_token(data=token_payload)
        
        logger.info(f"[Google OAuth] Login successful - ID: {user.id}, Username: {user.username}")
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "picture": user_info.get("picture"),
            "google_access_token": user.google_access_token, 
            "created_at": user.created_at.isoformat()
        }
        
        # Add user's info to JSON and URL
        user_json = urllib.parse.quote(json.dumps(user_data))
        redirect_url = f"{frontend_url}/login?token={access_token}&user={user_json}"
        
        logger.info(f"[Google OAuth] Redirecting with user data: {user_data}")
        logger.info(f"[Google OAuth] === CALLBACK END ===")
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"[Google OAuth] ERROR: {str(e)}", exc_info=True)
        db.rollback()
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/login?error=google_auth_failed")
    finally:
        db.close()

class UserUpdate(BaseModel):
    interests: Optional[List[str]] = None
    avatar_url: Optional[str] = None

@router.patch("/user/update")
def update_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's interests and avatar URL.
    """
    try:
        logger.info(f"[User Update] Updating user {current_user.username}")
        logger.info(f"[User Update] Data: {update_data}")
        
        if update_data.interests is not None:
            # Convert list to JSON string for SQLite
            current_user.interests = json.dumps(update_data.interests)
            logger.info(f"[User Update] Set interests: {current_user.interests}")
            
        if update_data.avatar_url is not None:
            current_user.avatar_url = update_data.avatar_url
            logger.info(f"[User Update] Set avatar: {update_data.avatar_url}")

        db.commit()
        db.refresh(current_user)
        
        logger.info(f"[User Update] Update successful")

        return {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "interests": json.loads(current_user.interests) if current_user.interests else [],  # ← Convert back to list
            "avatar_url": current_user.avatar_url,
            "created_at": current_user.created_at.isoformat(),
        }
    except Exception as e:
        logger.error(f"[User Update] ERROR: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")