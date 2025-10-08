# models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

# Literature-related schemas 
class AdvancedSearchFilters(BaseModel):
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    min_citations: Optional[int] = None
    authors: Optional[List[str]] = None
    journals: Optional[List[str]] = None
    open_access_only: Optional[bool] = False
    sort_by: Optional[str] = "relevance"

class LiteratureAdvancedSearchRequest(BaseModel):
    keyword: str
    limit: int = 10
    filters: Optional[AdvancedSearchFilters] = None

class Author(BaseModel):
    name: str
    affiliation: Optional[str] = None

class LiteratureItem(BaseModel):
    title: str
    authors: Optional[List[Author]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    published_date: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    citation_count: Optional[int] = 0
    source: Optional[str] = None

class LiteratureSearchResponse(BaseModel):
    total: int
    results: List[LiteratureItem]
    source: str

class LiteratureSearchRequest(BaseModel):
    keyword: str = Field(..., min_length=1, description="Search keyword")
    limit: int = Field(default=10, ge=1, le=50, description="Number of results")
    source: Literal["crossref", "arxiv", "openalex"] = Field(
        default="crossref",
        description="Data source: crossref, arxiv, or openalex"
    )
    sort_by: Optional[str] = Field("relevance", description="Sort by: relevance | year | citations")


class ReferenceFormatRequest(BaseModel):
    literature: LiteratureItem
    format: Literal["apa", "ieee", "mla"]

class ReferenceFormatResponse(BaseModel):
    formatted_reference: str
    format: str

# Plagiarism / AI detection schemas 

class PlagiarismTextRequest(BaseModel):
    """Request schema for direct text-based plagiarism/AI check."""
    text: str = Field(..., min_length=10, description="Text to analyze")
    check_ai: bool = Field(default=True, description="Whether to include AI content detection")

class PlagiarismFileRequest(BaseModel):
    """Placeholder (not used since we use UploadFile for file upload)."""
    check_ai: bool = Field(default=True)

class PlagiarismCheckResponse(BaseModel):
    """Unified response for plagiarism + AI detection."""
    plagiarism_probability: float = Field(..., ge=0.0, le=1.0)
    plagiarism_risk: str
    ai_probability: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_ai_generated: Optional[bool] = None
    ai_confidence: Optional[str] = None
    details: Optional[dict] = None
    timestamp: Optional[str] = None
