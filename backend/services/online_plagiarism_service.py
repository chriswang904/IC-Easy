# # services/online_plagiarism_service.py
# """
# Online Plagiarism Detection Service
# Compare user text against online academic papers
# """

# import httpx
# import logging
# from typing import List, Dict, Optional
# from services.plagiarism_service import PlagiarismService
# import re
# from collections import Counter
# import nltk

# logger = logging.getLogger(__name__)

# class OnlinePlagiarismService:
#     """Service for checking plagiarism against online academic papers"""
    
#     def __init__(self):
#         self.plagiarism_service = PlagiarismService()
#         self.timeout = 30.0
        
#         # Ensure NLTK data
#         try:
#             nltk.data.find('tokenizers/punkt')
#         except LookupError:
#             nltk.download('punkt', quiet=True)
#             nltk.download('punkt_tab', quiet=True)
    
#     def extract_keywords(self, text: str, top_n: int = 5) -> List[str]:
#         """
#         Extract top keywords from text for searching
        
#         Args:
#             text: Input text
#             top_n: Number of top keywords to extract
            
#         Returns:
#             List of keywords
#         """
#         # Remove special characters and convert to lowercase
#         text_clean = re.sub(r'[^a-zA-Z\s]', '', text.lower())
        
#         # Split into words
#         words = text_clean.split()
        
#         # Remove common stop words
#         stop_words = set([
#             'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
#             'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
#             'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
#             'would', 'should', 'can', 'could', 'may', 'might', 'must', 'this',
#             'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
#         ])
        
#         # Filter and count
#         filtered_words = [w for w in words if len(w) > 3 and w not in stop_words]
#         word_counts = Counter(filtered_words)
        
#         # Get top keywords
#         top_keywords = [word for word, count in word_counts.most_common(top_n)]
        
#         logger.info(f"[OnlinePlagiarism] Extracted keywords: {top_keywords}")
#         return top_keywords
    
#     async def search_crossref(self, keywords: List[str], limit: int = 5) -> List[Dict]:
#         """
#         Search CrossRef for academic papers
        
#         Args:
#             keywords: List of search keywords
#             limit: Maximum number of results
            
#         Returns:
#             List of paper metadata
#         """
#         query = " ".join(keywords)
#         url = "https://api.crossref.org/works"
        
#         params = {
#             "query": query,
#             "rows": limit,
#             "select": "DOI,title,abstract,author,published-print,URL"
#         }
        
#         try:
#             async with httpx.AsyncClient(timeout=self.timeout) as client:
#                 response = await client.get(url, params=params)
#                 response.raise_for_status()
                
#                 data = response.json()
#                 items = data.get("message", {}).get("items", [])
                
#                 papers = []
#                 for item in items:
#                     paper = {
#                         "source": "crossref",
#                         "doi": item.get("DOI"),
#                         "title": item.get("title", [""])[0] if item.get("title") else "Untitled",
#                         "abstract": item.get("abstract", ""),
#                         "authors": [
#                             f"{a.get('given', '')} {a.get('family', '')}"
#                             for a in item.get("author", [])
#                         ],
#                         "year": item.get("published-print", {}).get("date-parts", [[None]])[0][0],
#                         "url": item.get("URL", f"https://doi.org/{item.get('DOI')}")
#                     }
                    
#                     # Only include if has abstract or title
#                     if paper["abstract"] or paper["title"]:
#                         papers.append(paper)
                
#                 logger.info(f"[CrossRef] Found {len(papers)} papers")
#                 return papers
                
#         except Exception as e:
#             logger.error(f"[CrossRef] Search error: {e}")
#             return []
    
#     async def search_semantic_scholar(self, keywords: List[str], limit: int = 5) -> List[Dict]:
#         """
#         Search Semantic Scholar for academic papers
        
#         Args:
#             keywords: List of search keywords
#             limit: Maximum number of results
            
#         Returns:
#             List of paper metadata
#         """
#         query = " ".join(keywords)
#         url = "https://api.semanticscholar.org/graph/v1/paper/search"
        
#         params = {
#             "query": query,
#             "limit": limit,
#             "fields": "paperId,title,abstract,authors,year,url,citationCount"
#         }
        
#         try:
#             async with httpx.AsyncClient(timeout=self.timeout) as client:
#                 response = await client.get(url, params=params)
#                 response.raise_for_status()
                
#                 data = response.json()
#                 items = data.get("data", [])
                
#                 papers = []
#                 for item in items:
#                     paper = {
#                         "source": "semantic_scholar",
#                         "paper_id": item.get("paperId"),
#                         "title": item.get("title", "Untitled"),
#                         "abstract": item.get("abstract", ""),
#                         "authors": [a.get("name") for a in item.get("authors", [])],
#                         "year": item.get("year"),
#                         "url": item.get("url", ""),
#                         "citation_count": item.get("citationCount", 0)
#                     }
                    
#                     if paper["abstract"] or paper["title"]:
#                         papers.append(paper)
                
#                 logger.info(f"[SemanticScholar] Found {len(papers)} papers")
#                 return papers
                
#         except Exception as e:
#             logger.error(f"[SemanticScholar] Search error: {e}")
#             return []
    
#     async def search_arxiv(self, keywords: List[str], limit: int = 5) -> List[Dict]:
#         """
#         Search arXiv for papers
        
#         Args:
#             keywords: List of search keywords
#             limit: Maximum number of results
            
#         Returns:
#             List of paper metadata
#         """
#         import feedparser
        
#         query = "+".join(keywords)
#         url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={limit}"
        
#         try:
#             async with httpx.AsyncClient(timeout=self.timeout) as client:
#                 response = await client.get(url)
#                 response.raise_for_status()
                
#                 feed = feedparser.parse(response.text)
                
#                 papers = []
#                 for entry in feed.entries:
#                     paper = {
#                         "source": "arxiv",
#                         "arxiv_id": entry.id.split("/")[-1],
#                         "title": entry.title,
#                         "abstract": entry.summary,
#                         "authors": [author.name for author in entry.authors],
#                         "year": entry.published[:4],
#                         "url": entry.link
#                     }
#                     papers.append(paper)
                
#                 logger.info(f"[arXiv] Found {len(papers)} papers")
#                 return papers
                
#         except Exception as e:
#             logger.error(f"[arXiv] Search error: {e}")
#             return []
    
#     async def check_online_plagiarism(
#         self,
#         user_text: str,
#         search_sources: List[str] = ["crossref", "semantic_scholar", "arxiv"],
#         papers_per_source: int = 5,
#         method: str = "semantic"
#     ) -> Dict:
#         """
#         Check plagiarism against online academic papers
        
#         Args:
#             user_text: Text to check
#             search_sources: List of sources to search
#             papers_per_source: Number of papers to fetch per source
#             method: Similarity detection method
            
#         Returns:
#             Comprehensive plagiarism report with sources
#         """
#         logger.info(f"[OnlinePlagiarism] Starting online plagiarism check")
#         logger.info(f"[OnlinePlagiarism] Text length: {len(user_text)} characters")
        
#         # Step 1: Extract keywords
#         keywords = self.extract_keywords(user_text, top_n=5)
        
#         if not keywords:
#             return {
#                 "error": "Could not extract meaningful keywords from text",
#                 "status": "failed"
#             }
        
#         # Step 2: Search all sources in parallel
#         search_tasks = []
        
#         if "crossref" in search_sources:
#             search_tasks.append(self.search_crossref(keywords, papers_per_source))
        
#         if "semantic_scholar" in search_sources:
#             search_tasks.append(self.search_semantic_scholar(keywords, papers_per_source))
        
#         if "arxiv" in search_sources:
#             search_tasks.append(self.search_arxiv(keywords, papers_per_source))
        
#         # Execute all searches concurrently
#         import asyncio
#         search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
        
#         # Combine all papers
#         all_papers = []
#         for result in search_results:
#             if isinstance(result, list):
#                 all_papers.extend(result)
        
#         logger.info(f"[OnlinePlagiarism] Total papers found: {len(all_papers)}")
        
#         if not all_papers:
#             return {
#                 "error": "No papers found for comparison",
#                 "keywords_searched": keywords,
#                 "status": "no_results"
#             }
        
#         # Step 3: Extract reference texts (title + abstract)
#         reference_texts = []
#         paper_metadata = []
        
#         for paper in all_papers:
#             # Combine title and abstract for comparison
#             ref_text = f"{paper['title']}. {paper.get('abstract', '')}"
            
#             if ref_text.strip():
#                 reference_texts.append(ref_text)
#                 paper_metadata.append({
#                     "source": paper["source"],
#                     "title": paper["title"],
#                     "authors": paper.get("authors", []),
#                     "year": paper.get("year"),
#                     "url": paper.get("url"),
#                     "doi": paper.get("doi"),
#                     "citation_count": paper.get("citation_count")
#                 })
        
#         logger.info(f"[OnlinePlagiarism] Reference texts prepared: {len(reference_texts)}")
        
#         if not reference_texts:
#             return {
#                 "error": "No valid reference texts found",
#                 "status": "no_content"
#             }
        
#         # Step 4: Perform plagiarism check
#         if method == "semantic":
#             similarity_result = self.plagiarism_service.check_semantic_similarity(
#                 user_text, reference_texts
#             )
#         else:
#             similarity_result = self.plagiarism_service.check_tfidf_similarity(
#                 user_text, reference_texts
#             )
        
#         # Step 5: Sentence-level check
#         sentence_result = self.plagiarism_service.check_sentence_similarity(
#             user_text, reference_texts
#         )
        
#         # Step 6: Match papers with similarity scores
#         matched_papers = []
#         all_similarities = similarity_result.get("all_similarities", [])
        
#         for idx, similarity in enumerate(all_similarities):
#             if idx < len(paper_metadata):
#                 matched_paper = paper_metadata[idx].copy()
#                 matched_paper["similarity_score"] = float(similarity)
#                 matched_paper["risk_level"] = self.plagiarism_service.calculate_risk_level(similarity)
#                 matched_papers.append(matched_paper)
        
#         # Sort by similarity score (highest first)
#         matched_papers.sort(key=lambda x: x["similarity_score"], reverse=True)
        
#         # Step 7: Compile final result
#         result = {
#             "status": "success",
#             "keywords_searched": keywords,
#             "total_papers_checked": len(reference_texts),
#             "max_similarity": similarity_result.get("max_similarity", 0.0),
#             "avg_similarity": similarity_result.get("avg_similarity", 0.0),
#             "risk_level": self.plagiarism_service.calculate_risk_level(
#                 similarity_result.get("max_similarity", 0.0)
#             ),
#             "most_similar_paper": matched_papers[0] if matched_papers else None,
#             "matched_papers": matched_papers[:10],  # Top 10 matches
#             "sentence_analysis": sentence_result,
#             "method": method,
#             "sources_searched": search_sources
#         }
        
#         logger.info(f"[OnlinePlagiarism] Check complete - Max similarity: {result['max_similarity']:.2%}")
        
#         return result