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
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        self.scopes = os.getenv("GOOGLE_SCOPES").split(",")
        
    def get_authorization_url(self, state: str = None):
        """Generate Google OAuth authorization URL"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
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
        
        return auth_url, state
    
    def exchange_code_for_token(self, code: str):
        """Exchange authorization code for tokens"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes,
            redirect_uri=self.redirect_uri
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user info
        user_info = self.get_user_info(credentials)
        
        return {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            "user_info": user_info
        }
    
    def get_user_info(self, credentials):
        """Get user information from Google"""
        service = build('oauth2', 'v2', credentials=credentials)
        user_info = service.userinfo().get().execute()
        
        return {
            "google_id": user_info.get("id"),
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "picture": user_info.get("picture")
        }