"""
Enhanced Literature Recommendations API
Supports multiple data sources: OpenAlex, arXiv, and fallback data
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from models.user_model import User
from utils.auth import get_current_user_optional
from database import get_db
import logging
import requests
import xml.etree.ElementTree as ET
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

# Interest to topic mapping
INTEREST_TOPICS = {
    "AI": ["artificial intelligence", "machine learning", "deep learning"],
    "Biology": ["biology", "genomics", "molecular biology"],
    "Economics": ["economics", "finance", "econometrics"],
    "Medicine": ["medicine", "clinical", "healthcare"],
    "Physics": ["physics", "quantum", "particle physics"],
    "Environment": ["environment", "climate", "sustainability"]
}

# Fallback papers (in case APIs fail)
FALLBACK_PAPERS = [
    {
        "title": "Attention Is All You Need",
        "authors": [{"name": "Vaswani et al.", "affiliation": "Google"}],
        "abstract": "The dominant sequence transduction models...",
        "journal": "NeurIPS",
        "published_date": "2017-06-12",
        "doi": "arXiv:1706.03762",
        "url": "https://arxiv.org/abs/1706.03762",
        "citation_count": 90000,
        "source": "fallback",
        "topic": "artificial intelligence"
    },
    {
        "title": "BERT: Pre-training of Deep Bidirectional Transformers",
        "authors": [{"name": "Devlin et al.", "affiliation": "Google"}],
        "abstract": "We introduce BERT, a new language representation model...",
        "journal": "NAACL",
        "published_date": "2018-10-11",
        "doi": "arXiv:1810.04805",
        "url": "https://arxiv.org/abs/1810.04805",
        "citation_count": 75000,
        "source": "fallback",
        "topic": "machine learning"
    }
]


def get_arxiv_papers(topic: str, limit: int = 10) -> List[dict]:
    """
    Fetch papers from arXiv API
    """
    papers = []
    
    try:
        # arXiv query
        search_query = topic.replace(" ", "+")
        url = f"http://export.arxiv.org/api/query?search_query=all:{search_query}&start=0&max_results={limit}&sortBy=relevance"
        
        logger.info(f"[arXiv] Fetching papers for: {topic}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            # Parse XML
            root = ET.fromstring(response.content)
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            
            entries = root.findall('atom:entry', ns)
            logger.info(f"[arXiv] Found {len(entries)} papers")
            
            for entry in entries:
                title = entry.find('atom:title', ns)
                summary = entry.find('atom:summary', ns)
                published = entry.find('atom:published', ns)
                link = entry.find('atom:id', ns)
                
                authors = []
                for author in entry.findall('atom:author', ns):
                    name = author.find('atom:name', ns)
                    if name is not None:
                        authors.append({"name": name.text, "affiliation": None})
                
                # Extract arXiv ID from link
                arxiv_id = link.text.split('/')[-1] if link is not None else None
                
                paper = {
                    "title": title.text.strip() if title is not None else "Untitled",
                    "authors": authors[:3],
                    "abstract": summary.text.strip()[:300] + "..." if summary is not None else "",
                    "journal": "arXiv",
                    "published_date": published.text[:10] if published is not None else None,
                    "doi": f"arXiv:{arxiv_id}" if arxiv_id else None,
                    "url": link.text if link is not None else None,
                    "citation_count": 0,  # arXiv doesn't provide citation counts
                    "source": "arxiv",
                    "topic": topic
                }
                
                papers.append(paper)
        else:
            logger.error(f"[arXiv] Error: Status {response.status_code}")
            
    except Exception as e:
        logger.error(f"[arXiv] Exception: {e}")
    
    return papers


def get_openalex_papers(topic: str, limit: int = 10) -> List[dict]:
    """
    Fetch papers from OpenAlex API (improved version)
    """
    papers = []
    
    try:
        url = "https://api.openalex.org/works"
        params = {
            "search": topic,
            "sort": "cited_by_count:desc",
            "per_page": limit,
            "mailto": "support@example.com"
        }
        
        logger.info(f"[OpenAlex] Fetching papers for: {topic}")
        
        response = requests.get(url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            works = data.get("results", [])
            
            logger.info(f"[OpenAlex] Found {len(works)} papers")
            
            for item in works:
                authors = []
                for authorship in item.get("authorships", [])[:3]:
                    author = authorship.get("author", {})
                    authors.append({
                        "name": author.get("display_name", "Unknown"),
                        "affiliation": None
                    })
                
                primary_location = item.get("primary_location") or {}
                source = primary_location.get("source") or {}
                
                paper = {
                    "title": item.get("title") or item.get("display_name", "Untitled"),
                    "authors": authors,
                    "abstract": "Abstract available" if item.get("abstract_inverted_index") else "",
                    "journal": source.get("display_name"),
                    "published_date": item.get("publication_date"),
                    "doi": item.get("doi"),
                    "url": item.get("doi") or item.get("id"),
                    "citation_count": item.get("cited_by_count", 0),
                    "source": "openalex",
                    "topic": topic
                }
                
                papers.append(paper)
        else:
            logger.error(f"[OpenAlex] Error: Status {response.status_code}")
            
    except Exception as e:
        logger.error(f"[OpenAlex] Exception: {e}")
    
    return papers


def get_recommendations_multi_source(topics: List[str], limit: int = 15) -> List[dict]:
    """
    Fetch recommendations from multiple sources with fallback
    """
    all_papers = []
    seen_titles = set()
    
    for topic in topics[:3]:
        # Try OpenAlex first
        openalex_papers = get_openalex_papers(topic, limit=5)
        
        # Try arXiv if OpenAlex fails or returns few results
        arxiv_papers = []
        if len(openalex_papers) < 3:
            logger.info(f"[Multi-Source] OpenAlex returned few results, trying arXiv")
            arxiv_papers = get_arxiv_papers(topic, limit=5)
        
        # Combine results
        for paper in openalex_papers + arxiv_papers:
            title_lower = paper["title"].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                all_papers.append(paper)
                
                if len(all_papers) >= limit:
                    break
        
        if len(all_papers) >= limit:
            break
    
    # If still no results, use fallback papers
    if len(all_papers) == 0:
        logger.warning("[Multi-Source] No papers from APIs, using fallback data")
        all_papers = FALLBACK_PAPERS[:limit]
    
    # Sort by citation count
    all_papers.sort(key=lambda x: x.get("citation_count", 0), reverse=True)
    
    logger.info(f"[Multi-Source] Returning {len(all_papers)} papers")
    
    return all_papers[:limit]


@router.get("/personalized")
async def get_personalized_recommendations(
    limit: int = Query(15, ge=1, le=50),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get personalized literature recommendations based on user interests
    """
    
    # Determine topics based on user interests
    if current_user and current_user.interests and len(current_user.interests) > 0:
        logger.info(f"[Recommendations] User {current_user.username} interests: {current_user.interests}")
        
        topics = []
        for interest in current_user.interests:
            if interest in INTEREST_TOPICS:
                topics.extend(INTEREST_TOPICS[interest])
        
        if not topics:
            topics = ["artificial intelligence"]
            
    else:
        logger.info("[Recommendations] No user or interests, using default topics")
        topics = ["artificial intelligence", "machine learning"]
    
    logger.info(f"[Recommendations] Fetching papers for topics: {topics[:3]}")
    
    try:
        recommendations = get_recommendations_multi_source(topics, limit)
        
        return {
            "total": len(recommendations),
            "results": recommendations,
            "topics": topics[:3],
            "personalized": current_user is not None and bool(current_user.interests)
        }
        
    except Exception as e:
        logger.error(f"[Recommendations] Error: {e}", exc_info=True)
        
        # Return fallback data even on error
        return {
            "total": len(FALLBACK_PAPERS),
            "results": FALLBACK_PAPERS[:limit],
            "topics": ["artificial intelligence"],
            "personalized": False
        }


@router.get("/by-interest/{interest}")
async def get_recommendations_by_interest(
    interest: str,
    limit: int = Query(10, ge=1, le=30)
):
    """
    Get literature recommendations for a specific interest
    """
    
    if interest not in INTEREST_TOPICS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interest. Must be one of: {', '.join(INTEREST_TOPICS.keys())}"
        )
    
    topics = INTEREST_TOPICS[interest]
    logger.info(f"[Recommendations] Fetching papers for interest '{interest}': {topics}")
    
    try:
        recommendations = get_recommendations_multi_source(topics, limit)
        
        return {
            "total": len(recommendations),
            "results": recommendations,
            "interest": interest,
            "topics": topics
        }
        
    except Exception as e:
        logger.error(f"[Recommendations] Error: {e}", exc_info=True)
        
        # Return fallback data
        return {
            "total": len(FALLBACK_PAPERS),
            "results": FALLBACK_PAPERS[:limit],
            "interest": interest,
            "topics": topics
        }


@router.get("/health")
async def recommendations_health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "recommendations",
        "available_interests": list(INTEREST_TOPICS.keys())
    }