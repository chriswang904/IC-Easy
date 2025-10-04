# services/crossref_service.py
import requests
from typing import List, Dict, Optional
from models.schemas import LiteratureItem, Author
import logging
import re

logger = logging.getLogger(__name__)

class CrossRefService:
    """Service for interacting with CrossRef API"""
    
    BASE_URL = "https://api.crossref.org/works"
    
    def __init__(self):
        self.session = requests.Session()
        # Set user agent for better API performance (CrossRef recommendation)
        self.session.headers.update({
            'User-Agent': 'ChromeAIChallenge/1.0 (mailto:your-email@example.com)'
        })
    
    def search_literature(self, keyword: str, limit: int = 10) -> List[LiteratureItem]:
        """
        Search literature using CrossRef API
        
        Args:
            keyword: Search query keyword
            limit: Maximum number of results to return
            
        Returns:
            List of LiteratureItem objects
        """
        try:
            # Safety Constraints
            limit = min(limit, 50)

            # Build API request URL
            params = {
                'query': keyword,
                'rows': limit,
                'select': 'DOI,title,author,abstract,published,container-title,is-referenced-by-count'
            }
            
            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            items = data.get('message', {}).get('items', [])
            
            # Parse and convert to LiteratureItem format
            literature_items = []
            for item in items:
                literature_items.append(self._parse_crossref_item(item))
            
            return literature_items
            
        except requests.exceptions.RequestException as e:
            logger.error(f"CrossRef API Error: {e}")
            return []
    
    def get_by_doi(self, doi: str) -> Optional[LiteratureItem]:
        """
        Get specific literature by DOI
        
        Args:
            doi: Digital Object Identifier
            
        Returns:
            LiteratureItem object or None
        """
        try:
            url = f"{self.BASE_URL}/{doi}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            item = data.get('message', {})
            
            return self._parse_crossref_item(item)
            
        except requests.exceptions.RequestException as e:
            print(f"CrossRef DOI lookup error: {e}")
            return None
    
    def _parse_crossref_item(self, item: Dict) -> LiteratureItem:
        """
        Parse CrossRef API response item to LiteratureItem schema
        
        Args:
            item: Raw item from CrossRef API
            
        Returns:
            LiteratureItem object
        """
        # Extract authors
        authors = []
        for author in item.get('author', []):
            name = f"{author.get('given', '')} {author.get('family', '')}".strip()
            if name:
                authors.append(Author(
                    name=name,
                    affiliation=author.get('affiliation', [{}])[0].get('name') if author.get('affiliation') else None
                ))
        
        # Extract publication date
        published_date = None
        for key in ['published', 'published-print', 'issued']:
            if key in item:
                date_parts = item[key].get('date-parts', [[]])[0]
                if date_parts:
                    # Format: YYYY or YYYY-MM or YYYY-MM-DD
                    parts_str = []
                    for i, part in enumerate(date_parts):
                        if i == 0:  # Year
                            parts_str.append(str(part))
                        else:  # Month or Day - pad with zero
                            parts_str.append(str(part).zfill(2))
                    
                    published_date = '-'.join(parts_str)
                    break
                
        # Get title (CrossRef returns titles as arrays)
        title = item.get('title', ['Untitled'])[0] if item.get('title') else 'Untitled'
        
        # Get journal name
        journal = item.get('container-title', [''])[0] if item.get('container-title') else None
        
        abstract_raw = item.get('abstract')
        if abstract_raw:
            abstract = re.sub('<[^<]+?>', '', abstract_raw).strip()
        else:
            abstract = None

        return LiteratureItem(
            title=title,
            authors=authors if authors else [Author(name="Unknown Author")],
            abstract=abstract,
            doi=item.get('DOI'),
            url=f"https://doi.org/{item.get('DOI')}" if item.get('DOI') else None,
            published_date=published_date,
            journal=journal,
            citation_count=item.get('is-referenced-by-count', 0),
            source="crossref"
        )