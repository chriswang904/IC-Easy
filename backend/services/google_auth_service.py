# ./services/google_auth_service.py
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class GoogleAuthService:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
        
        # Fixed scopes parsing
        scopes_str = os.getenv("GOOGLE_SCOPES", "openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile")
        self.scopes = [s.strip() for s in scopes_str.split(",")]
        
        # Validation
        if not self.client_id or self.client_id == "None":
            raise ValueError("GOOGLE_CLIENT_ID not set in environment variables")
        if not self.client_secret or self.client_secret == "None":
            raise ValueError("GOOGLE_CLIENT_SECRET not set in environment variables")
        
        logger.info(f"[Google Auth] Initialized with scopes: {self.scopes}")
        
    def get_authorization_url(self, state: str = None):
        """Generate Google OAuth authorization URL"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/v2/auth",  # ← Updated to v2
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes,
            redirect_uri=self.redirect_uri
        )
        
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state,
            prompt='consent'
        )
        
        logger.info(f"[Google Auth] Generated auth URL: {auth_url[:100]}...")
        
        return auth_url, state
    
    def exchange_code_for_token(self, code: str):
        """Exchange authorization code for tokens"""
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/v2/auth",  # ← Updated to v2
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [self.redirect_uri]
                    }
                },
                scopes=self.scopes,
                redirect_uri=self.redirect_uri
            )
            
            logger.info(f"[Google Auth] Exchanging code for token...")
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Get user info
            user_info = self.get_user_info(credentials)
            
            logger.info(f"[Google Auth] Successfully retrieved user info for: {user_info.get('email')}")
            
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_expiry": credentials.expiry.isoformat() if credentials.expiry else None,
                "user_info": user_info
            }
        except Exception as e:
            logger.error(f"[Google Auth] Token exchange error: {str(e)}", exc_info=True)
            raise
    
    def get_user_info(self, credentials):
        """Get user information from Google"""
        try:
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            
            return {
                "google_id": user_info.get("id"),
                "email": user_info.get("email"),
                "name": user_info.get("name"),
                "picture": user_info.get("picture")
            }
        except Exception as e:
            logger.error(f"[Google Auth] Failed to get user info: {str(e)}", exc_info=True)
            raise