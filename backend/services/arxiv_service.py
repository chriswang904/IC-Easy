# services/arxiv_service.py
import requests
import feedparser
from typing import List, Optional
from models.schemas import LiteratureItem, Author
from datetime import datetime
import html

class ArXivService:
    """Service for interacting with arXiv API"""
    
    BASE_URL = "https://export.arxiv.org/api/query"
    
    def __init__(self):
        self.session = requests.Session()
    
    def search_literature(self, keyword: str, limit: int = 10) -> List[LiteratureItem]:
        """
        Search literature using arXiv API
        
        Args:
            keyword: Search query keyword
            limit: Maximum number of results
            
        Returns:
            List of LiteratureItem objects
        """
        try:
            # Build query parameters
            params = {
                'search_query': f'all:{keyword}',
                'start': 0,
                'max_results': limit,
                'sortBy': 'relevance',
                'sortOrder': 'descending'
            }
            
            response = self.session.get(self.BASE_URL, params=params, timeout=15)
            response.raise_for_status()
            
            # Parse RSS/Atom feed
            feed = feedparser.parse(response.content)
            
            # Convert entries to LiteratureItem format
            literature_items = []
            for entry in feed.entries:
                literature_items.append(self._parse_arxiv_entry(entry))
            
            return literature_items
            
        except requests.exceptions.RequestException as e:
            print(f"[ArXivService] Error fetching '{keyword}': {e}")
            return []
        except Exception as e:
            print(f"arXiv parsing error: {e}")
            return []
    
    def get_by_id(self, arxiv_id: str) -> Optional[LiteratureItem]:
        """
        Get specific paper by arXiv ID
        
        Args:
            arxiv_id: arXiv identifier (e.g., '2103.00020' or 'cs.AI/0001001')
            
        Returns:
            LiteratureItem object or None
        """
        try:
            # Clean arXiv ID (remove version if present)
            clean_id = arxiv_id.split('v')[0]
            
            params = {
                'id_list': clean_id,
                'max_results': 1
            }
            
            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            if feed.entries:
                return self._parse_arxiv_entry(feed.entries[0])
            
            return None
            
        except Exception as e:
            print(f"arXiv ID lookup error: {e}")
            return None
    
    def _parse_arxiv_entry(self, entry) -> LiteratureItem:
        """
        Parse arXiv feed entry to LiteratureItem schema
        
        Args:
            entry: Feed entry from arXiv API
            
        Returns:
            LiteratureItem object
        """
        # Extract authors
        authors = []
        if hasattr(entry, 'authors'):
            for author in entry.authors:
                authors.append(Author(name=author.name))
        elif hasattr(entry, 'author'):
            authors.append(Author(name=entry.author))
        
        # Extract arXiv ID from entry id
        arxiv_id = entry.id.split('/abs/')[-1] if hasattr(entry, 'id') else None
        
        # Extract publication date
        published_date = None
        if hasattr(entry, 'published'):
            try:
                dt = datetime.strptime(entry.published, '%Y-%m-%dT%H:%M:%SZ')
                published_date = dt.strftime('%Y-%m-%d')
            except:
                published_date = entry.published[:10]  # Take first 10 chars (YYYY-MM-DD)
        
        # Extract abstract (clean HTML tags if present)
        abstract = None
        if hasattr(entry, 'summary'):
            abstract = entry.summary.strip()
            # Remove newlines and extra spaces
            abstract = ' '.join(abstract.split())
            abstract = html.unescape(abstract) 
        
        # Extract primary category (journal equivalent)
        journal = None
        if hasattr(entry, 'arxiv_primary_category'):
            journal = f"arXiv:{entry.arxiv_primary_category.get('term', 'Unknown')}"
        elif hasattr(entry, 'tags'):
            # Fallback to first tag
            journal = f"arXiv:{entry.tags[0].term}" if entry.tags else "arXiv"
        
        # Extract DOI (most arXiv preprints don't have DOI until formally published)
        doi = None
        if hasattr(entry, 'arxiv_doi'):
            doi = entry.arxiv_doi
        elif hasattr(entry, 'links'):
            for link in entry.links:
                href = link.get('href', '')
                if 'doi.org' in href:
                    # Extract DOI from URL
                    doi = href.replace('https://doi.org/', '').replace('http://doi.org/', '')
                    break

        return LiteratureItem(
            title = entry.title.replace("\n", " ").strip()[:500] if hasattr(entry, 'title') else 'Untitled',
            authors=authors if authors else [Author(name="Unknown Author")],
            abstract=abstract,
            doi = doi,
            url=entry.id if hasattr(entry, 'id') else None,
            published_date=published_date,
            journal=journal,
            citation_count=0,  # arXiv doesn't provide citation counts
            source="arxiv"
        )