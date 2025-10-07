# backend/services/openalex_service.py
import requests
from typing import List, Optional
from models.schemas import LiteratureItem, Author
import logging
import re
import html

logger = logging.getLogger(__name__)

class OpenAlexService:
    """Service for interacting with OpenAlex API"""

    BASE_URL = "https://api.openalex.org/works"

    def __init__(self):
        self.session = requests.Session()

    def search_literature(self, keyword: str, limit: int = 10, sort_by: str = "relevance") -> List[LiteratureItem]:
        """Search literature using OpenAlex API"""
        try:
            # Build params WITHOUT mailto
            params = {
                "search": keyword,
                "per_page": min(limit, 50),
            }
            
            # Add sort parameter if needed
            if sort_by == "year":
                params["sort"] = "publication_year:desc"
            elif sort_by == "citations":
                params["sort"] = "cited_by_count:desc"

            logger.info(f"[OpenAlex] Searching keyword='{keyword}'")
            
            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            
            logger.info(f"[OpenAlex] Response status: {response.status_code}")
            
            response.raise_for_status()

            data = response.json()
            results = data.get("results", [])
            meta = data.get("meta", {})
            
            total_count = meta.get("count", 0)
            logger.info(f"[OpenAlex] API returned {len(results)} results (total available: {total_count})")

            if not results:
                logger.warning(f"[OpenAlex] No results found for keyword='{keyword}'")
                return []

            # Parse results and filter out invalid ones (None)
            parsed_results = []
            for work in results:
                parsed = self._parse_openalex_work(work)
                if parsed is not None:  # Only add valid results
                    parsed_results.append(parsed)
            
            logger.info(f"[OpenAlex] Returning {len(parsed_results)} valid results (filtered from {len(results)})")
            
            return parsed_results

        except requests.exceptions.Timeout:
            logger.error(f"[OpenAlex] Request timeout for keyword='{keyword}'")
            return []
        except requests.exceptions.HTTPError as e:
            logger.error(f"[OpenAlex] HTTP Error: {e}")
            return []
        except Exception as e:
            logger.error(f"[OpenAlex] Unknown error: {e}", exc_info=True)
            return []

    def _parse_openalex_work(self, work: dict) -> LiteratureItem:
        """Parse OpenAlex work JSON into LiteratureItem schema"""
        try:
            # Extract title and decode HTML entities
            title = work.get("display_name", "").strip()
            
            # Decode HTML entities (e.g., &lt;i&gt; -> <i>)
            title = html.unescape(title)
            
            # Remove HTML tags (e.g., <i>EM</i> -> EM)
            import re
            title = re.sub(r'<[^>]+>', '', title)
            
            # Clean up extra whitespace
            title = ' '.join(title.split())
            
            # Validate title
            if not title or title.lower() == "untitled" or len(title) < 3:
                work_id = work.get("id", "unknown")
                logger.debug(f"[OpenAlex] Skipping work with invalid title: {work_id}")
                return None
            
            # Extract authors from authorships
            authorships = work.get("authorships", [])
            authors = [
                Author(name=a.get("author", {}).get("display_name", "Unknown"))
                for a in authorships
            ]

            # Extract DOI (remove prefix if present)
            doi = work.get("doi")
            if doi and doi.startswith("https://doi.org/"):
                doi = doi.replace("https://doi.org/", "")

            # Extract publication date
            pub_date = work.get("publication_date") or str(work.get("publication_year", ""))

            # Extract journal/source information
            primary_location = work.get("primary_location", {})
            source = primary_location.get("source", {})
            journal = source.get("display_name")

            return LiteratureItem(
                title=title,
                authors=authors if authors else [Author(name="Unknown Author")],
                abstract=self._reconstruct_abstract(work.get("abstract_inverted_index")),
                doi=doi,
                url=work.get("id"),
                published_date=pub_date,
                journal=journal,
                citation_count=work.get("cited_by_count", 0),
                source="openalex"
            )
        except Exception as e:
            logger.error(f"[OpenAlex] Parsing error: {e}", exc_info=True)
            return None

    def _reconstruct_abstract(self, inverted_index: Optional[dict]) -> Optional[str]:
        """Reconstruct abstract text from OpenAlex inverted index format"""
        if not inverted_index:
            return None
        
        try:
            word_positions = []
            for word, positions in inverted_index.items():
                for pos in positions:
                    word_positions.append((pos, word))
            
            sorted_words = [word for _, word in sorted(word_positions)]
            abstract = " ".join(sorted_words)
            
            if len(abstract) > 5000:
                abstract = abstract[:5000] + "..."
                
            return abstract
            
        except Exception as e:
            logger.warning(f"[OpenAlex] Abstract reconstruction failed: {e}")
            return None

    def get_by_openalex_id(self, openalex_id: str) -> Optional[LiteratureItem]:
        """Fetch specific work by OpenAlex ID"""
        try:
            if not openalex_id.startswith("https://"):
                if not openalex_id.startswith("W"):
                    openalex_id = f"W{openalex_id}"
                url = f"https://api.openalex.org/works/{openalex_id}"
            else:
                work_id = openalex_id.split("/")[-1]
                url = f"https://api.openalex.org/works/{work_id}"
            
            logger.info(f"[OpenAlex] Fetching work by ID: {openalex_id}")
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            work = response.json()
            return self._parse_openalex_work(work)
            
        except Exception as e:
            logger.error(f"[OpenAlex] Failed to fetch work {openalex_id}: {e}")
            return None