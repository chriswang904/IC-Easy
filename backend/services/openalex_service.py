# services/openalex_service.py
import requests
from typing import List, Optional
from models.schemas import LiteratureItem, Author

class OpenAlexService:
    """Service for interacting with OpenAlex API"""
    
    BASE_URL = "https://api.openalex.org/works"  
    
    def __init__(self):
        self.session = requests.Session()
        # OpenAlex requests a polite email in User-Agent
        self.session.headers.update({
            'User-Agent': 'ChromeAIChallenge/1.0 (mailto:your-email@example.com)'
        })
    
    def search_literature(self, keyword: str, limit: int = 10) -> List[LiteratureItem]:
        """
        Search literature using OpenAlex API
        
        Args:
            keyword: Search query keyword
            limit: Maximum number of results
            
        Returns:
            List of LiteratureItem objects
        """
        try:
            # Build API request URL
            url = self.BASE_URL  
            params = {
                'search': keyword,
                'per_page': min(limit, 200),  # OpenAlex max is 200
                'sort': 'relevance_score:desc'
            }
            
            response = self.session.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('results', [])
            
            # Parse and convert to LiteratureItem format
            literature_items = []
            for work in results:
                literature_items.append(self._parse_openalex_work(work))
            
            return literature_items
            
        except requests.exceptions.RequestException as e:
            print(f"[OpenAlex] Search failed for '{keyword}': {e}")  
            return []
        except Exception as e:
            print(f"[OpenAlex] Parsing error: {e}")  
            return []
    
    def get_by_doi(self, doi: str) -> Optional[LiteratureItem]:
        """
        Get specific work by DOI using OpenAlex
        
        Args:
            doi: Digital Object Identifier
            
        Returns:
            LiteratureItem object or None
        """
        try:
            url = f"https://api.openalex.org/works/https://doi.org/{doi}"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            work = response.json()
            return self._parse_openalex_work(work)
            
        except Exception as e:
            print(f"[OpenAlex] DOI lookup failed for '{doi}': {e}") 
            return None
    
    def get_by_openalex_id(self, openalex_id: str) -> Optional[LiteratureItem]:
        """
        Get specific work by OpenAlex ID
        
        Args:
            openalex_id: OpenAlex identifier (e.g., 'W2741809807')
            
        Returns:
            LiteratureItem object or None
        """
        try:
            url = f"https://api.openalex.org/works/{openalex_id}"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            work = response.json()
            return self._parse_openalex_work(work)
            
        except Exception as e:
            print(f"[OpenAlex] ID lookup failed for '{openalex_id}': {e}")  
            return None
    
    def _parse_openalex_work(self, work: dict) -> LiteratureItem:
        """
        Parse OpenAlex work to LiteratureItem schema
        
        Args:
            work: Raw work object from OpenAlex API
            
        Returns:
            LiteratureItem object
        """
        # Extract authors
        authors = []
        authorships = work.get('authorships', [])
        for authorship in authorships:
            author_info = authorship.get('author', {})
            author_name = author_info.get('display_name', 'Unknown')
            
            # Get affiliation if available
            affiliations = authorship.get('institutions', [])
            affiliation = affiliations[0].get('display_name') if affiliations else None
            
            authors.append(Author(name=author_name, affiliation=affiliation))
        
        # Extract DOI 
        raw_doi = work.get('doi')
        if raw_doi:
            doi = raw_doi.replace('https://doi.org/', '').replace('http://doi.org/', '').strip()
        else:
            doi = None
        
        # Extract publication date with fallback to year 
        published_date = work.get('publication_date')
        if not published_date and work.get('publication_year'):
            published_date = str(work.get('publication_year'))
        
        # Extract journal/venue name
        journal = None
        primary_location = work.get('primary_location', {})
        if primary_location:
            source = primary_location.get('source', {})
            journal = source.get('display_name')
        
        # Get abstract (OpenAlex stores inverted index, need to reconstruct)
        abstract = self._reconstruct_abstract(work.get('abstract_inverted_index'))
        
        # Get citation count
        citation_count = work.get('cited_by_count', 0)
        
        # Get URL
        url = work.get('doi') or work.get('id')  # Use DOI or OpenAlex ID as URL
        
        return LiteratureItem(
            title=work.get('title', 'Untitled'),
            authors=authors if authors else [Author(name="Unknown Author")],
            abstract=abstract,
            doi=doi,
            url=url,
            published_date=published_date,
            journal=journal,
            citation_count=citation_count,
            source="openalex"
        )
    
    def _reconstruct_abstract(self, inverted_index: Optional[dict]) -> Optional[str]:
        """
        Reconstruct abstract from OpenAlex inverted index format
        
        Args:
            inverted_index: Dictionary mapping words to position lists
            
        Returns:
            Reconstructed abstract string or None
        """
        if not inverted_index:
            return None
        
        try:
            word_positions = [
                (pos, word) 
                for word, positions in inverted_index.items() 
                for pos in positions
            ]
            return ' '.join(word for _, word in sorted(word_positions))
            
        except Exception as e:
            print(f"[OpenAlex] Abstract reconstruction error: {e}")
            return None