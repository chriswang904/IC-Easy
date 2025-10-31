# api/literature.py
from fastapi import APIRouter, HTTPException, Query, Depends, File, UploadFile
from fastapi.responses import PlainTextResponse
from typing import List, Optional
from models.schemas import (
    LiteratureAdvancedSearchRequest,
    LiteratureSearchRequest,
    LiteratureSearchResponse,
    ReferenceFormatRequest,
    ReferenceFormatResponse,
    LiteratureItem
)
from services.crossref_service import CrossRefService
from services.arxiv_service import ArXivService
from services.openalex_service import OpenAlexService
from services.literature_aggregator import LiteratureAggregator
from services.history_service import HistoryService
from utils.reference_formatter import ReferenceFormatter
from utils.auth import get_current_user_optional
from models.user_model import User
from database import get_db
from typing import Optional
from sqlalchemy.orm import Session
import logging
from datetime import datetime
import PyPDF2

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/literature", tags=["Literature"])

# Initialize aggregator
literature_aggregator = LiteratureAggregator()

# Initialize services
crossref_service = CrossRefService()
arxiv_service = ArXivService()
openalex_service = OpenAlexService()
reference_formatter = ReferenceFormatter()

TOPIC_TO_ARXIV = {
    "ai": "cs.AI",
    "economics": "econ.EM",
    "biology": "q-bio.BM",
    "physics": "physics.gen-ph",
    "environment": "physics.ao-ph",
    "medicine": "q-bio.TO",
}


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
        # Deafault as relevance
        sort_by = getattr(request, "sort_by", "relevance")

        # Route to appropriate service based on source
        if request.source == "crossref":
            results = crossref_service.search_literature(request.keyword, request.limit, sort_by)
        elif request.source == "arxiv":
            results = arxiv_service.search_literature(request.keyword, request.limit, sort_by)
        elif request.source == "openalex":
            results = openalex_service.search_literature(request.keyword, request.limit, sort_by)
        else:
            logger.warning(f"[Literature Search] Unsupported source: {request.source}")
            raise HTTPException(status_code=400, detail=f"Unsupported source: {request.source}")
        
        if sort_by == "year":
            results.sort(key=lambda x: int(x.published_date[:4]) if x.published_date else 0, reverse=True)
        elif sort_by == "citations":
            results.sort(key=lambda x: x.citation_count or 0, reverse=True)
        
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
async def get_literature_by_doi(
    doi: str, 
    source: str = Query(default="crossref", description="Data source to use")
):
    """
    Get specific literature details by DOI (CrossRef + fallback to OpenAlex)
    """
    # Normalize DOI (handle full URLs like https://doi.org/...)
    doi = doi.replace("https://doi.org/", "").strip()

    if not doi:
        logger.warning("[DOI Lookup] Empty DOI provided")
        raise HTTPException(status_code=400, detail="DOI cannot be empty")

    logger.info(f"[DOI Lookup] Fetching literature - doi={doi}, source={source}")

    try:
        literature = None

        # Try CrossRef first
        if source == "crossref":
            literature = crossref_service.get_by_doi(doi)
            if not literature:
                logger.warning(f"[DOI Lookup] CrossRef returned no result for {doi}, trying OpenAlex fallback...")
                try:
                    literature = openalex_service.get_by_doi(doi)
                except Exception as e:
                    logger.error(f"[DOI Lookup] OpenAlex fallback failed: {e}")

        # Directly query OpenAlex if requested
        elif source == "openalex":
            literature = openalex_service.get_by_doi(doi)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported source: {source}. Use 'crossref' or 'openalex'."
            )

        # Return result or raise 404
        if not literature:
            logger.warning(f"[DOI Lookup] No metadata found for DOI {doi}")
            raise HTTPException(
                status_code=404, 
                detail=f"No metadata found for DOI {doi}. Try manual entry."
            )

        return literature

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[DOI Lookup] Unexpected error: {e}", exc_info=True)
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

@router.post("/extract-pdf-metadata")
async def extract_pdf_metadata(file: UploadFile = File(...)):
    # Example: using PyPDF2 or pdfminer to extract title/authors from PDF
    pdf_reader = PyPDF2.PdfReader(file.file)
    meta = pdf_reader.metadata or {}

    return {
        "title": meta.get("/Title", ""),
        "authors": [{"first": a, "last": ""} for a in meta.get("/Author", "").split(",") if a],
        "year": 2025,
        "publisher": "",
    }


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

@router.post("/search-all", response_model=LiteratureSearchResponse)
async def search_all_sources(
    request: LiteratureAdvancedSearchRequest, 
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Search literature across ALL sources with advanced filters
    """
    if not request.keyword.strip():
        raise HTTPException(status_code=400, detail="Keyword cannot be empty")
    
    logger.info(
        f"[Advanced Search] Keyword='{request.keyword}', "
        f"Source={request.source}, Sort={request.sort_by}, "
        f"Filters={request.filters}"
    )
    
    try:
        # Convert filters to dict and add sort_by
        filters_dict = None
        if request.filters:
            filters_dict = request.filters.dict(exclude_none=True)
            filters_dict["sort_by"] = request.sort_by  # Add sort_by to filters
        else:
            filters_dict = {"sort_by": request.sort_by}
        
        # Perform aggregated search
        results = await literature_aggregator.search_all_sources(
            keyword=request.keyword,
            limit_per_source=request.limit,
            filters=filters_dict
        )
        
        # Log to history if user is authenticated
        if current_user:
            try:
                HistoryService(db).log_search(
                    keyword=request.keyword,
                    source=request.source,
                    total_results=len(results),
                    user_id=current_user.id
                )
            except Exception as e:
                logger.warning(f"[Search History] Failed to log: {e}")
        
        logger.info(f"[Advanced Search] Returned {len(results)} results")
        
        return LiteratureSearchResponse(
            total=len(results),
            results=results,
            source=request.source,
            query=request.keyword,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"[Advanced Search] Failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/export-bibtex", response_class=PlainTextResponse)
async def export_bibtex_format(literature_list: List[LiteratureItem]):
    """
    Export literature list as BibTeX file
    
    Args:
        literature_list: List of LiteratureItem objects
        
    Returns:
        BibTeX formatted text file
    """
    try:
        from utils.reference_formatter import export_bibtex
        
        bibtex_content = export_bibtex(literature_list)
        
        return PlainTextResponse(
            content=bibtex_content,
            media_type="application/x-bibtex",
            headers={"Content-Disposition": "attachment; filename=references.bib"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export-ris", response_class=PlainTextResponse)
async def export_ris_format(literature_list: List[LiteratureItem]):
    """Export literature list as RIS file (EndNote/Zotero compatible)"""
    try:
        from utils.reference_formatter import export_ris
        
        ris_content = export_ris(literature_list)
        
        return PlainTextResponse(
            content=ris_content,
            media_type="application/x-research-info-systems",
            headers={"Content-Disposition": "attachment; filename=references.ris"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/latest")
def get_latest(
    source: str = Query("arxiv", description='arxiv | openalex'),
    topic_key: str = Query(..., description='e.g., ai, economics, biology'),
    limit: int = Query(3, ge=1, le=50),
    mode: str = Query("latest", description='latest | citations'), 
):
    topic_key = topic_key.lower().strip()
    if source not in ("arxiv", "openalex"):
        raise HTTPException(status_code=400, detail="source must be 'arxiv' or 'openalex'")

    fetch_limit = limit * 3

    if source == "arxiv":
        cat = TOPIC_TO_ARXIV.get(topic_key)
        if not cat:
            raise HTTPException(status_code=400, detail=f"Unknown topic_key: {topic_key}")
        items = arxiv_service.latest_by_category(cat, limit=fetch_limit)
        
        items_dict = [i.dict() for i in items]
        items_dict = filter_valid_papers(items_dict)
        
        if mode == "citations":
            items_dict.sort(key=lambda x: x.get('citation_count', 0) or 0, reverse=True)
        
        items_dict = items_dict[:limit]
        
        logger.info(f"[Latest] Returned {len(items_dict)} valid papers for topic '{topic_key}' (mode={mode})")
        
        return {"results": items_dict, "source": "arxiv"}

    # source == "openalex"
    keyword = {
        "ai": "artificial intelligence",
        "economics": "economics",
        "biology": "biology",
        "physics": "physics",
        "environment": "environmental science",
        "medicine": "medicine",
    }.get(topic_key, topic_key)

    sort_by = "citations" if mode == "citations" else "year"
    
    logger.info(f"[Latest] Fetching from OpenAlex - keyword='{keyword}', mode='{mode}', sort_by='{sort_by}'")
    
    items = openalex_service.search_literature(
        keyword=keyword, 
        limit=fetch_limit, 
        sort_by=sort_by 
    )
    
    items_dict = [i.dict() for i in items]
    items_dict = filter_valid_papers(items_dict)
    
    if mode == "citations":
        items_dict.sort(key=lambda x: x.get('citation_count', 0) or 0, reverse=True)
    elif mode == "latest":
        items_dict.sort(key=lambda x: x.get('published_date', ''), reverse=True)
    
    items_dict = items_dict[:limit]
    
    logger.info(f"[Latest] Returned {len(items_dict)} valid papers for topic '{topic_key}' (mode={mode})")
    
    return {"results": items_dict, "source": "openalex"}


def filter_valid_papers(papers):
    today = datetime.now()
    valid_papers = []
    
    for paper in papers:
        pub_date = paper.get('published_date')
        if pub_date:
            try:
                if 'T' in pub_date:
                    paper_date = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                else:
                    paper_date = datetime.strptime(pub_date, '%Y-%m-%d')
                
                if paper_date.date() <= today.date():
                    valid_papers.append(paper)
                else:
                    logger.info(f"[Filter] Skipping future date paper: {paper.get('title')} ({pub_date})")
            except Exception as e:
                logger.warning(f"[Filter] Date parse error for {paper.get('title')}: {e}")
                valid_papers.append(paper)
        else:
            valid_papers.append(paper)
    
    return valid_papers


