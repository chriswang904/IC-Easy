# api/literature.py
from fastapi import APIRouter, HTTPException, Query
from models.schemas import (
    LiteratureSearchRequest,
    LiteratureSearchResponse,
    ReferenceFormatRequest,
    ReferenceFormatResponse,
    LiteratureItem
)
from services.crossref_service import CrossRefService
from services.arxiv_service import ArXivService
from services.openalex_service import OpenAlexService
from utils.reference_formatter import ReferenceFormatter
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/literature", tags=["Literature"])

# Initialize services
crossref_service = CrossRefService()
arxiv_service = ArXivService()
openalex_service = OpenAlexService()
reference_formatter = ReferenceFormatter()

@router.post("/search", response_model=LiteratureSearchResponse)
async def search_literature(request: LiteratureSearchRequest):
    """
    Search for academic literature using specified data source
    
    Available sources:
    - crossref: General academic papers with DOI
    - arxiv: Preprints in physics, math, CS, etc.
    - openalex: Open access comprehensive database
    
    Args:
        request: LiteratureSearchRequest containing keyword, limit, and source
        
    Returns:
        LiteratureSearchResponse with list of literature items
    """

    # Check Parameter
    if not request.keyword.strip():
        logger.warning("[Literature Search] Empty keyword provided")
        raise HTTPException(
            status_code=400,
            detail="Keyword cannot be empty or contain only whitespace"
        )
    
    if len(request.keyword) > 500:
        logger.warning(f"[Literature Search] Keyword too long: {len(request.keyword)} characters")
        raise HTTPException(
            status_code=400,
            detail="Keyword is too long (maximum 500 characters allowed)"
        )
    
    # Record search requests
    logger.info(
        f"[Literature Search] Starting search - "
        f"keyword='{request.keyword}', source={request.source}, limit={request.limit}"
    )

    try:
        # Route to appropriate service based on source
        if request.source == "crossref":
            results = crossref_service.search_literature(request.keyword, request.limit)
        elif request.source == "arxiv":
            results = arxiv_service.search_literature(request.keyword, request.limit)
        elif request.source == "openalex":
            results = openalex_service.search_literature(request.keyword, request.limit)
        else:
            logger.warning(f"[Literature Search] Unsupported source: {request.source}")
            raise HTTPException(status_code=400, detail=f"Unsupported source: {request.source}")
        
        logger.info(f"[Literature Search] Found {len(results)} results from {request.source}")
        
        return LiteratureSearchResponse(
            total=len(results),
            results=results,
            source=request.source
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Record unexpected error
        logger.error(
            f"[Literature Search] Unexpected error occurred - "
            f"keyword='{request.keyword}', source={request.source}, error={str(e)}",
            exc_info=True  # Include stack trace
        )
        raise HTTPException(status_code=500, detail=f"Literature search failed: {str(e)}")
    
@router.get("/doi/{doi:path}", response_model=LiteratureItem)
async def get_literature_by_doi(doi: str, source: str = Query(default="crossref", description="Data source to use")):
    """
    Get specific literature details by DOI
    
    Args:
        doi: Digital Object Identifier (e.g., 10.1000/xyz123)
        source: Data source (crossref or openalex)
        
    Returns:
        LiteratureItem object with full details
    """

    # Validate Parameter
    if not doi.strip():
        logger.warning("[DOI Lookup] Empty DOI provided")
        raise HTTPException(status_code=400, detail="DOI cannot be empty")
    
    # Record Lookup
    logger.info(f"[DOI Lookup] Fetching literature - doi={doi}, source={source}")
    

    try:
        if source == "crossref":
            literature = crossref_service.get_by_doi(doi)
        elif source == "openalex":
            literature = openalex_service.get_by_doi(doi)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported source: {source}. Use 'crossref' or 'openalex'"
            )
        
        if literature is None:
            raise HTTPException(status_code=404, detail=f"Literature with DOI {doi} not found")
        
        return literature
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch literature: {str(e)}")

@router.get("/arxiv/{arxiv_id}", response_model=LiteratureItem)
async def get_literature_by_arxiv_id(arxiv_id: str):
    """
    Get specific paper by arXiv ID
    
    Args:
        arxiv_id: arXiv identifier (e.g., '2103.00020')
        
    Returns:
        LiteratureItem object with full details
    """

    # Validate Parameter
    if not arxiv_id.strip():
        logger.warning("[arXiv Lookup] Empty arXiv ID provided")
        raise HTTPException(status_code=400, detail="arXiv ID cannot be empty")
    
    logger.info(f"[arXiv Lookup] Fetching paper - arxiv_id={arxiv_id}")

    try:
        literature = arxiv_service.get_by_id(arxiv_id)
        
        if literature is None:
            raise HTTPException(status_code=404, detail=f"Paper with arXiv ID {arxiv_id} not found")
        
        return literature
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch arXiv paper: {str(e)}")

@router.get("/openalex/{openalex_id}", response_model=LiteratureItem)
async def get_literature_by_openalex_id(openalex_id: str):
    """
    Get specific work by OpenAlex ID
    
    Args:
        openalex_id: OpenAlex identifier (e.g., 'W2741809807')
        
    Returns:
        LiteratureItem object with full details
    """

    # Validate Parameter
    if not openalex_id.strip():
        logger.warning("[OpenAlex Lookup] Empty OpenAlex ID provided")
        raise HTTPException(status_code=400, detail="OpenAlex ID cannot be empty")
    
    logger.info(f"[OpenAlex Lookup] Fetching work - openalex_id={openalex_id}")

    try:
        literature = openalex_service.get_by_openalex_id(openalex_id)
        
        if literature is None:
            raise HTTPException(status_code=404, detail=f"Work with OpenAlex ID {openalex_id} not found")
        
        return literature
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch OpenAlex work: {str(e)}")

@router.post("/format-reference", response_model=ReferenceFormatResponse)
async def format_reference(request: ReferenceFormatRequest):
    """
    Format a literature reference in specified citation style
    
    Args:
        request: ReferenceFormatRequest containing literature data and format type
        
    Returns:
        ReferenceFormatResponse with formatted citation string
    """

    logger.info(f"[Reference Format] Formatting citation - format={request.format}, title='{request.literature.title[:50]}...'")

    try:
        # Select formatting method based on requested style
        if request.format.lower() == "apa":
            formatted = reference_formatter.format_apa(request.literature)
        elif request.format.lower() == "ieee":
            formatted = reference_formatter.format_ieee(request.literature)
        elif request.format.lower() == "mla":
            formatted = reference_formatter.format_mla(request.literature)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported citation format: {request.format}. Use 'apa', 'ieee', or 'mla'"
            )
        
        return ReferenceFormatResponse(
            formatted_reference=formatted,
            format=request.format.lower()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reference formatting failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for literature API"""

    logger.debug("[Health Check] Literature API health check requested")
    
    return {
        "status": "healthy",
        "service": "literature",
        "available_sources": ["crossref", "arxiv", "openalex"],
        "available_formats": ["apa", "ieee", "mla"]
    }