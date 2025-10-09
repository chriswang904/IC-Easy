# models/schemas.py (COMPLETE VERSION)
"""
Pydantic schemas for API requests and responses
Includes all schemas for Literature, Plagiarism, History, and Auth
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

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

class LiteratureSearchRequest(BaseModel):
    """Basic literature search request"""
    keyword: str = Field(..., min_length=2, description="Search keyword")
    limit: int = Field(default=10, ge=1, le=50, description="Number of results")
    source: str = Field(default="crossref", description="Data source: crossref/arxiv/openalex")

class LiteratureSearchFilters(BaseModel):
    """Advanced search filters"""
    sort_by: Optional[str] = "relevance"
    author: Optional[str] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    journal: Optional[str] = None
    keywords: Optional[str] = None
    citation_min: Optional[int] = None
    citation_max: Optional[int] = None
    open_access: Optional[bool] = False
    
class LiteratureAdvancedSearchRequest(BaseModel):
    """Advanced literature search with filters"""
    keyword: str = Field(..., min_length=2, description="Search keyword")
    limit: int = Field(default=10, ge=1, le=50, description="Number of results")
    source: str = Field(default="crossref", description="Data source: crossref/arxiv/openalex/semantic_scholar")
    year_from: Optional[int] = Field(default=None, description="Start year filter")
    year_to: Optional[int] = Field(default=None, description="End year filter")
    author: Optional[str] = Field(default=None, description="Author name filter")
    sort_by: Optional[str] = Field(default="relevance", description="Sort by: relevance/date/citations")

class Author(BaseModel):
    """Author information"""
    name: str
    affiliation: Optional[str] = None

class LiteratureItem(BaseModel):
    """Single literature item"""
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    source: str
    citation_count: Optional[int] = None
    journal: Optional[str] = None
    keywords: Optional[List[str]] = Field(default_factory=list)

class LiteratureSearchResponse(BaseModel):
    """Response schema for literature search"""
    results: List[LiteratureItem]
    total: int
    source: str
    query: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class ReferenceFormatRequest(BaseModel):
    """Request schema for reference formatting"""
    literature: Dict[str, Any] = Field(..., description="Literature metadata")
    format_style: str = Field(default="apa", description="Citation style: apa/ieee/mla/chicago")

class ReferenceFormatResponse(BaseModel):
    """Response schema for formatted reference"""
    formatted_reference: str
    style: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class BatchReferenceFormatRequest(BaseModel):
    """Batch reference formatting request"""
    references: List[Dict[str, Any]] = Field(..., description="List of literature items")
    format_style: str = Field(default="apa", description="Citation style")

class BatchReferenceFormatResponse(BaseModel):
    """Batch reference formatting response"""
    formatted_references: List[str]
    style: str
    total: int
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class SentenceSimilarity(BaseModel):
    """Sentence-level similarity result"""
    sentence: str
    max_similarity: float
    similar_source_idx: Optional[int] = None

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

