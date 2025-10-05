# services/literature_aggregator.py
import asyncio
from typing import List, Dict, Set, Optional
from models.schemas import LiteratureItem
from services.crossref_service import CrossRefService
from services.arxiv_service import ArXivService
from services.openalex_service import OpenAlexService
import logging
import re

logger = logging.getLogger(__name__)

class LiteratureAggregator:
    """Aggregate and deduplicate literature from multiple sources"""
    
    def __init__(self):
        """Initialize services for all data sources"""
        self.crossref = CrossRefService()
        self.arxiv = ArXivService()
        self.openalex = OpenAlexService()
        logger.info("[LiteratureAggregator] Initialized with CrossRef, arXiv, and OpenAlex services")
    
    async def search_all_sources(
        self, 
        keyword: str, 
        limit_per_source: int = 10,
        filters: Optional[dict] = None
    ) -> List[LiteratureItem]:
        """
        Search all available sources and merge results with filtering and sorting
        
        Args:
            keyword: Search query
            limit_per_source: Maximum results per source
            filters: Optional advanced filters (year_min, year_max, min_citations, 
                     authors, journals, open_access_only, sort_by)
            
        Returns:
            Deduplicated, filtered, and sorted list of literature items
        """
        try:
            # Define source names for better logging
            sources = ["CrossRef", "ArXiv", "OpenAlex"]
            
            logger.info(
                f"[LiteratureAggregator] Starting multi-source search - "
                f"keyword='{keyword}', limit_per_source={limit_per_source}, "
                f"filters={'enabled' if filters else 'none'}"
            )
            
            # Create concurrent tasks for all sources
            crossref_task = asyncio.to_thread(
                self.crossref.search_literature, keyword, limit_per_source
            )
            arxiv_task = asyncio.to_thread(
                self.arxiv.search_literature, keyword, limit_per_source
            )
            openalex_task = asyncio.to_thread(
                self.openalex.search_literature, keyword, limit_per_source
            )
            
            # Execute all searches concurrently
            results = await asyncio.gather(
                crossref_task, 
                arxiv_task, 
                openalex_task,
                return_exceptions=True
            )
            
            # Collect valid results and log errors
            all_papers = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.warning(
                        f"[LiteratureAggregator] {sources[i]} search failed - "
                        f"error: {str(result)}"
                    )
                    continue
                
                if result:
                    logger.info(
                        f"[LiteratureAggregator] {sources[i]} returned "
                        f"{len(result)} papers"
                    )
                    all_papers.extend(result)
                else:
                    logger.warning(f"[LiteratureAggregator] {sources[i]} returned empty results")
            
            if not all_papers:
                logger.warning(
                    f"[LiteratureAggregator] No papers found for keyword '{keyword}'"
                )
                return []
            
            # Deduplicate by DOI and title
            deduplicated = self._deduplicate_papers(all_papers)
            logger.info(
                f"[LiteratureAggregator] Deduplication: "
                f"{len(all_papers)} → {len(deduplicated)} unique papers"
            )
            
            # Apply advanced filters
            if filters:
                filtered = self._apply_advanced_filters(deduplicated, filters)
                logger.info(
                    f"[LiteratureAggregator] Filtering applied: "
                    f"{len(deduplicated)} → {len(filtered)} papers "
                    f"(filters: {self._format_filter_summary(filters)})"
                )
            else:
                filtered = deduplicated
            
            # Apply sorting
            sorted_papers = self._apply_sorting(filtered, filters)
            sort_by = filters.get('sort_by', 'citations') if filters else 'citations'
            logger.info(f"[LiteratureAggregator] Sorted by: {sort_by}")
            
            # Limit final results
            max_results = limit_per_source * 3
            final_results = sorted_papers[:max_results]
            
            logger.info(
                f"[LiteratureAggregator] Final results: {len(final_results)} papers "
                f"(aggregated: {len(all_papers)}, unique: {len(deduplicated)}, "
                f"filtered: {len(filtered)})"
            )
            
            return final_results
            
        except Exception as e:
            logger.error(
                f"[LiteratureAggregator] Aggregation failed for keyword '{keyword}' - "
                f"error: {str(e)}", 
                exc_info=True
            )
            return []
    
    def _deduplicate_papers(
        self, 
        papers: List[LiteratureItem]
    ) -> List[LiteratureItem]:
        """
        Remove duplicate papers based on DOI and title similarity
        
        1. First pass: deduplicate by DOI (exact match)
        2. Second pass: deduplicate by normalized title
        
        Args:
            papers: List of papers potentially containing duplicates
            
        Returns:
            List of unique papers
        """
        seen_dois: Set[str] = set()
        seen_titles: Set[str] = set()
        unique_papers = []
        
        duplicates_by_doi = 0
        duplicates_by_title = 0
        
        for paper in papers:
            # Check DOI uniqueness
            if paper.doi:
                if paper.doi in seen_dois:
                    duplicates_by_doi += 1
                    continue
                seen_dois.add(paper.doi)
            
            # Check title uniqueness (normalized)
            normalized_title = self._normalize_title(paper.title)
            if normalized_title in seen_titles:
                duplicates_by_title += 1
                continue
            seen_titles.add(normalized_title)
            
            unique_papers.append(paper)
        
        if duplicates_by_doi > 0 or duplicates_by_title > 0:
            logger.debug(
                f"[LiteratureAggregator] Removed duplicates: "
                f"{duplicates_by_doi} by DOI, {duplicates_by_title} by title"
            )
        
        return unique_papers
    
    def _apply_advanced_filters(
        self,
        papers: List[LiteratureItem],
        filters: Optional[dict]
    ) -> List[LiteratureItem]:
        """
        Apply advanced filters to paper list
        
        Supported filters:
        - year_min: Minimum publication year
        - year_max: Maximum publication year
        - min_citations: Minimum citation count
        - authors: List of author names to match
        - journals: List of journal/conference names to match
        - open_access_only: Only include open access papers
        
        Args:
            papers: List of papers to filter
            filters: Dictionary of filter criteria
            
        Returns:
            Filtered list of papers
        """
        if not filters:
            return papers
        
        filtered = []
        
        for paper in papers:
            # Year range filter
            if filters.get("year_min") or filters.get("year_max"):
                year = self._extract_year(paper.published_date)
                if year == 0:
                    # Skip papers without valid year if year filter is active
                    continue
                
                if filters.get("year_min") and year < filters["year_min"]:
                    continue
                if filters.get("year_max") and year > filters["year_max"]:
                    continue
            
            # Citation count filter
            if filters.get("min_citations"):
                citation_count = paper.citation_count or 0
                if citation_count < filters["min_citations"]:
                    continue
            
            # Author filter (case-insensitive partial match)
            if filters.get("authors"):
                if not paper.authors:
                    continue
                
                author_names = [a.name.lower() for a in paper.authors]
                filter_authors = [a.lower() for a in filters["authors"]]
                
                # Check if any filter author is in any paper author name
                if not any(
                    any(filter_author in author_name for author_name in author_names)
                    for filter_author in filter_authors
                ):
                    continue
            
            # Journal filter (case-insensitive partial match)
            if filters.get("journals"):
                if not paper.journal:
                    continue
                
                journal_lower = paper.journal.lower()
                filter_journals = [j.lower() for j in filters["journals"]]
                
                if not any(filter_journal in journal_lower for filter_journal in filter_journals):
                    continue
            
            # Open access filter
            if filters.get("open_access_only"):
                # Simple heuristic: check if paper has accessible URL
                # More sophisticated: check DOI for OA status
                if not paper.url:
                    continue
            
            # Paper passed all filters
            filtered.append(paper)
        
        return filtered
    
    def _apply_sorting(
        self,
        papers: List[LiteratureItem],
        filters: Optional[dict]
    ) -> List[LiteratureItem]:
        """
        Sort papers by specified criteria
        
        Supported sorting options:
        - citations: Sort by citation count (descending)
        - year: Sort by publication year (descending, newest first)
        - journal_impact: Sort by journal impact factor (placeholder)
        - relevance: Keep original order (API relevance score)
        
        Args:
            papers: List of papers to sort
            filters: Dictionary containing 'sort_by' key
            
        Returns:
            Sorted list of papers
        """
        if not filters or not filters.get("sort_by"):
            # Default: sort by citations
            sort_by = "citations"
        else:
            sort_by = filters["sort_by"]
        
        try:
            if sort_by == "citations":
                sorted_papers = sorted(
                    papers, 
                    key=lambda x: x.citation_count or 0, 
                    reverse=True
                )
            
            elif sort_by == "year":
                sorted_papers = sorted(
                    papers,
                    key=lambda x: self._extract_year(x.published_date),
                    reverse=True
                )
            
            elif sort_by == "journal_impact":
                # Placeholder: would need journal impact factor database
                # For now, use citation count as proxy
                logger.warning(
                    "[LiteratureAggregator] Journal impact sorting not implemented, "
                    "using citation count as proxy"
                )
                sorted_papers = sorted(
                    papers,
                    key=lambda x: x.citation_count or 0,
                    reverse=True
                )
            
            elif sort_by == "relevance":
                # Keep original order (from API relevance ranking)
                sorted_papers = papers
            
            else:
                logger.warning(
                    f"[LiteratureAggregator] Unknown sort_by value: '{sort_by}', "
                    f"using default (citations)"
                )
                sorted_papers = sorted(
                    papers,
                    key=lambda x: x.citation_count or 0,
                    reverse=True
                )
            
            return sorted_papers
            
        except Exception as e:
            logger.error(
                f"[LiteratureAggregator] Sorting failed with sort_by='{sort_by}' - "
                f"error: {str(e)}, returning unsorted"
            )
            return papers
    
    @staticmethod
    def _normalize_title(title: str) -> str:
        """
        Normalize title for comparison
        
        Removes punctuation, converts to lowercase, and normalizes whitespace
        
        Args:
            title: Original title string
            
        Returns:
            Normalized title string
        """
        if not title:
            return ""
        
        # Remove special characters (keep only alphanumeric and spaces)
        normalized = re.sub(r'[^\w\s]', '', title.lower())
        # Collapse multiple spaces into single space
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        return normalized
    
    @staticmethod
    def _extract_year(date_str: Optional[str]) -> int:
        """
        Extract year from date string
        
        Supports various date formats:
        - ISO format: 2024-01-15
        - Year only: 2024
        - Partial dates: 2024-01
        
        Args:
            date_str: Date string in various formats
            
        Returns:
            Year as integer, or 0 if not found
        """
        if not date_str:
            return 0
        
        # Search for 4-digit year (19xx or 20xx)
        match = re.search(r'\b(19|20)\d{2}\b', str(date_str))
        return int(match.group(0)) if match else 0
    
    @staticmethod
    def _format_filter_summary(filters: dict) -> str:
        """
        Create human-readable summary of active filters
        
        Args:
            filters: Dictionary of filter criteria
            
        Returns:
            Comma-separated string of active filters
        """
        active_filters = []
        
        if filters.get("year_min") or filters.get("year_max"):
            year_range = []
            if filters.get("year_min"):
                year_range.append(f"≥{filters['year_min']}")
            if filters.get("year_max"):
                year_range.append(f"≤{filters['year_max']}")
            active_filters.append(f"year: {' & '.join(year_range)}")
        
        if filters.get("min_citations"):
            active_filters.append(f"citations ≥{filters['min_citations']}")
        
        if filters.get("authors"):
            active_filters.append(f"authors: {len(filters['authors'])} specified")
        
        if filters.get("journals"):
            active_filters.append(f"journals: {len(filters['journals'])} specified")
        
        if filters.get("open_access_only"):
            active_filters.append("open access only")
        
        return ", ".join(active_filters) if active_filters else "none"