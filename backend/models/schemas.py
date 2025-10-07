# models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, date

# Added Advanced Search
class AdvancedSearchFilters(BaseModel):
    year_min: Optional[int] = Field(None, description="Minimum publication year")
    year_max: Optional[int] = Field(None, description="Maximum publication year")
    min_citations: Optional[int] = Field(None, description="Minimum citation count")
    authors: Optional[List[str]] = Field(None, description="Filter by author names")
    journals: Optional[List[str]] = Field(None, description="Filter by journal or conference")
    open_access_only: Optional[bool] = Field(False, description="Only include open access papers")
    sort_by: Optional[str] = Field("relevance", description="Sort by: relevance | citations | year | journal_impact")

class LiteratureAdvancedSearchRequest(BaseModel):
    keyword: str
    limit: int = 10
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
    citation_count: Optional[int] = 0
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

# Plagiarism check request schema
class PlagiarismCheckRequest(BaseModel):
    user_text: str = Field(..., min_length=10, description="Text to check for plagiarism")
    reference_texts: List[str] = Field(..., description="Reference texts to compare against")
    # method: str = Field(default="tfidf", description="Method: tfidf or semantic")
    method: Literal["tfidf", "semantic"] = Field(default="tfidf", description="Similarity method type")

# Plagiarism check response schema
class PlagiarismCheckResponse(BaseModel):
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score (0-1)")
    risk_level: str = Field(..., description="Risk level: low, medium, or high")
    details: Optional[dict] = None

# Filtered Search
class LiteratureSearchRequest(BaseModel):
    keyword: str = Field(..., min_length=1, description="Search keyword")
    limit: int = Field(default=10, ge=1, le=50, description="Number of results")
    source: Literal["crossref", "arxiv", "openalex"] = Field(default="crossref")
    sort_by: Optional[str] = Field("relevance", description="Sort by: relevance | year | citations")
