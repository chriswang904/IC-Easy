# models/schemas.py
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any, Union, Literal
from datetime import datetime, date

# ==================== USER & AUTH SCHEMAS ====================

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: Optional[str] = None

class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    """Token payload data"""
    email: Optional[str] = None
    user_id: Optional[int] = None

# ==================== LITERATURE SCHEMAS ====================

# Added Advanced Search
class AdvancedSearchFilters(BaseModel):
    """Advanced search filters - matches frontend field names"""
    author: Optional[str] = Field(None, description="Filter by author name")
    year_from: Optional[int] = Field(None, ge=1900, le=2100, description="Minimum publication year")
    year_to: Optional[int] = Field(None, ge=1900, le=2100, description="Maximum publication year")
    journal: Optional[str] = Field(None, description="Filter by journal or conference")
    keywords: Optional[List[str]] = Field(None, description="Filter by keywords")
    citation_min: Optional[int] = Field(None, ge=0, description="Minimum citation count")
    citation_max: Optional[int] = Field(None, ge=0, description="Maximum citation count")
    open_access: Optional[bool] = Field(False, description="Only include open access papers")

    
class LiteratureAdvancedSearchRequest(BaseModel):
    """Advanced search request"""
    keyword: str = Field(..., min_length=1, max_length=500)
    limit: int = Field(10, ge=1, le=50)
    source: str = Field("all", pattern="^(all|crossref|arxiv|openalex)$")
    sort_by: str = Field("relevance", pattern="^(relevance|year|citations)$")
    filters: Optional[AdvancedSearchFilters] = None

# Literature search request schema
class LiteratureSearchRequest(BaseModel):
    keyword: str = Field(..., min_length=1, description="Search keyword")
    limit: int = Field(default=10, ge=1, le=50, description="Number of results")
    source: Literal["crossref", "arxiv", "openalex"] = Field(
        default="crossref",
        description="Data source: crossref, arxiv, or openalex"
    )

# Author information schema
class Author(BaseModel):
    name: str
    affiliation: Optional[str] = None

# Literature item schema
class LiteratureItem(BaseModel):
    title: str
    authors: Optional[List[Author]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    month: Optional[str] = None
    published_date: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    citation_count: Optional[int] = None
    source: Optional[str] = None  # crossref, arxiv, or openalex

# Literature search response schema
class LiteratureSearchResponse(BaseModel):
    total: int
    results: List[LiteratureItem]
    source: str

# Reference format request schema
class ReferenceFormatRequest(BaseModel):
    literature: LiteratureItem
    # format: str = Field(..., description="Citation format: apa, ieee, or mla")
    format: Literal["apa", "ieee", "mla"]

# Reference format response schema
class ReferenceFormatResponse(BaseModel):
    formatted_reference: str
    format: str



  # ==================== HISTORY SCHEMAS ====================

class HistoryItem(BaseModel):
    """History record"""
    id: int
    user_id: int
    action_type: str
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryCreateRequest(BaseModel):
    """Create history record"""
    action_type: str = Field(..., description="Type of action: search/format/check")
    data: Dict[str, Any] = Field(..., description="Action data")

class HistoryListResponse(BaseModel):
    """Response schema for history list"""
    items: List[HistoryItem]
    total: int
    page: int = 1
    page_size: int = 20

class HistoryStatsResponse(BaseModel):
    """History statistics"""
    total_searches: int
    total_formats: int
    total_checks: int
    recent_activities: List[HistoryItem]

# ==================== EXPORT SCHEMAS ====================

class ExportRequest(BaseModel):
    """Export data request"""
    items: List[Dict[str, Any]] = Field(..., description="Items to export")
    format: str = Field(default="json", description="Export format: json/csv/bibtex")

class ExportResponse(BaseModel):
    """Export data response"""
    data: Union[str, List[Dict[str, Any]]]
    format: str
    filename: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# ==================== COMMON RESPONSE SCHEMAS ====================

class SuccessResponse(BaseModel):
    """Generic success response"""
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class ErrorResponse(BaseModel):
    """Generic error response"""
    error: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: str
    services: Dict[str, str]

# ==================== VALIDATION ====================

class PlagiarismTextRequest(BaseModel):
    """Request schema for text plagiarism check with validation"""
    text: str = Field(..., min_length=50, description="Text to check")
    check_ai: bool = Field(default=True, description="Enable AI detection")
    check_plagiarism: bool = Field(default=True, description="Enable plagiarism detection")
    use_online_apis: bool = Field(default=True, description="Use online APIs")
    custom_author: Optional[str] = Field(default=None, description="Optional author name")

    @validator('text')
    def validate_text_length(cls, v):
        if len(v.strip()) < 50:
            raise ValueError('Text must be at least 50 characters long')
        if len(v) > 50000:
            raise ValueError('Text is too long (maximum 50,000 characters)')
        return v