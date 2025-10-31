# backend/api/knowledge.py
from fastapi import APIRouter
from services.coci_service import COCIService
from services.openalex_graph_service import OpenAlexGraphService
from services.crossref_service import CrossRefService
from services.lens_service import LensService
from services.cache_service import CacheService
import logging
import requests
import re
from typing import List, Dict

OPENALEX_BASE = "https://api.openalex.org"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "IC-Easy/knowledge-graph"})

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Graph"])

# Initialize service clients
coci = COCIService()
openalex = OpenAlexGraphService()
lens = LensService()
crossref = CrossRefService()
cache = CacheService(ttl_seconds=86400)  # 1 day cache


def clean_html_tags(text: str) -> str:
    """
    Remove HTML tags from text.
    Example: '<i>Ab initio</i>' -> 'Ab initio'
    """
    if not text:
        return ""
    return re.sub(r'<[^>]*>', '', text)


 
# Helper function to normalize and clean graph data
 
def normalize_graph(graph: dict, doi: str, source_name: str):
    """Ensure that the returned graph follows a unified format."""
    if not graph:
        return None

    nodes = []
    edges = []

    # Normalize node structure
    for node in graph.get("nodes", []):
        node_id = node.get("id") or node.get("doi") or doi
        label = node.get("label") or node.get("title") or "Untitled"
        # Clean HTML tags from label
        label = clean_html_tags(label)
        group = node.get("type") or node.get("group") or "paper"
        meta = {
            "source": source_name,
            "doi": node.get("doi") or (node_id if "10." in node_id else None)
        }
        nodes.append({
            "id": node_id,
            "label": label[:150],
            "group": group,
            "meta": meta
        })

    # Normalize edge structure
    for edge in graph.get("edges", []):
        src = edge.get("source")
        tgt = edge.get("target")
        etype = edge.get("type") or "cites"
        if src and tgt:
            edges.append({
                "source": src,
                "target": tgt,
                "type": etype,
                "weight": edge.get("weight", 1.0)
            })

    # Return unified structure
    return {
        "nodes": nodes,
        "edges": edges,
        "source": source_name,
        "message": f"Data from {source_name}"
    }


 
# Unified Citation Graph Endpoint
 
@router.get("/citation-graph/{doi:path}")
async def get_citation_graph(doi: str, max_nodes: int = 60):
    """
    Build a citation knowledge graph by combining multiple open data sources:
    1. OpenCitations (COCI)
    2. OpenAlex
    3. Lens.org
    4. CrossRef metadata fallback
    """

    # Normalize DOI input
    doi = doi.replace("https://doi.org/", "").strip().lower()
    logger.info(f"[KnowledgeGraph] Building graph for {doi}")

    # Step 1: Check cache
    cached = cache.get(doi)
    if cached:
        logger.info(f"[Cache] Hit for DOI: {doi}")
        return cached

    # Step 2: Data sources in priority order
    SOURCES = [
        ("OpenCitations (COCI)", lambda: coci.get_citation_graph(doi, max_nodes)),
        ("OpenAlex", lambda: openalex.build_citation_graph(doi, max_nodes)),
        ("Lens.org", lambda: lens.get_citation_graph(doi, max_nodes)),
    ]

    for name, fetch_func in SOURCES:
        try:
            graph = fetch_func()
            normalized = normalize_graph(graph, doi, name)
            if normalized and normalized["edges"]:
                logger.info(f"[KnowledgeGraph] Success with {name}")
                cache.set(doi, normalized)
                return normalized
        except Exception as e:
            logger.warning(f"[{name}] failed: {e}")

    # Step 3: Fallback – CrossRef metadata only
    try:
        meta = crossref.get_by_doi(doi)
        if meta:
            graph = {
                "nodes": [
                    {
                        "id": doi,
                        "label": clean_html_tags(meta.title or doi),
                        "group": "paper",
                        "meta": {"source": "CrossRef", "doi": doi}
                    }
                ],
                "edges": [],
                "source": "CrossRef",
                "message": "No citation data — showing metadata from CrossRef."
            }
            cache.set(doi, graph)
            return graph
    except Exception as e:
        logger.warning(f"[CrossRef] failed: {e}")

    # Step 4: No data available
    graph = {
        "nodes": [
            {"id": doi, "label": f"DOI: {doi}", "group": "paper", "meta": {"source": "None"}}
        ],
        "edges": [],
        "source": "None",
        "message": "This paper is not indexed in any open database."
    }
    cache.set(doi, graph)
    return graph


 
# Optional: Author Network (using OpenAlex)
 
@router.get("/author-network/{author_id}")
async def get_author_network(author_id: str, limit: int = 50):
    """
    Build a co-author network for a given OpenAlex author ID.
    Example: A1969205039
    """
    try:
        graph = openalex.build_author_network(author_id, limit)
        normalized = normalize_graph(graph, author_id, "OpenAlex Author Network")
        return normalized
    except Exception as e:
        logger.warning(f"[AuthorNetwork] failed: {e}")
        return {"nodes": [], "edges": [], "message": "Unable to build author network."}


 
# Optional: Topic Evolution (OpenAlex keyword trend)
 
@router.get("/topic-evolution")
async def get_topic_evolution(keyword: str, years: int = 10):
    """
    Return publication trend for a given keyword (per year) using OpenAlex data.
    """
    try:
        trend = openalex.topic_trend(keyword, years)
        return trend
    except Exception as e:
        logger.warning(f"[TopicEvolution] failed: {e}")
        return {"keyword": keyword, "points": [], "message": "Trend data unavailable"}


@router.get("/openalex/author-search")
async def author_search(name: str, per_page: int = 8):
    """
    Search OpenAlex authors by display name and return a compact list.
    """
    params = {"search": name, "per-page": per_page}
    r = SESSION.get(f"{OPENALEX_BASE}/authors", params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    results = []
    for row in data.get("results", []):
        oid = row.get("id", "")
        # id is a full URL; keep only the trailing token "Axxxxxxxx"
        short_id = oid.split("/")[-1] if oid else None
        results.append({
            "id": short_id,
            "name": clean_html_tags(row.get("display_name", "")),
            "works_count": row.get("works_count"),
            "cited_by_count": row.get("cited_by_count"),
        })
    return results

def _top_cited_works(keyword: str, n: int = 10) -> List[Dict]:
    """
    Return top-cited works for a keyword using OpenAlex search.
    """
    params = {"search": keyword, "sort": "cited_by_count:desc", "per-page": n}
    r = SESSION.get(f"{OPENALEX_BASE}/works", params=params, timeout=30)
    r.raise_for_status()
    works = []
    for w in r.json().get("results", []):
        raw_title = w.get("title") or ""
        works.append({
            "id": w.get("id"),  # https://openalex.org/W...
            "title": clean_html_tags(raw_title),
            "doi": w.get("doi").replace("https://doi.org/", "") if w.get("doi") else None,
            "cited_by_count": w.get("cited_by_count", 0),
            "referenced_works": w.get("referenced_works", []) or [],  # list of openalex ids
            "concepts": [clean_html_tags(c.get("display_name", "")) for c in (w.get("concepts") or [])],
        })
    return works

@router.get("/topic-graph/{keyword}/top-cited")
async def topic_top_cited(keyword: str, n: int = 10):
    """
    Build a mind-map style graph:
    - center node = keyword
    - child nodes = top-cited papers under this keyword
    """
    works = _top_cited_works(keyword, n)
    center_id = f"topic::{keyword.lower()}"
    nodes = [{"id": center_id, "label": keyword, "group": "topic", "meta": {"source": "OpenAlex"}}]
    edges = []
    for w in works:
        nodes.append({
            "id": w["id"],
            "label": w["title"] or w["id"],
            "group": "top_cited",
            "meta": {"source": "OpenAlex", "doi": w["doi"], "cited_by": w["cited_by_count"]},
        })
        edges.append({"source": center_id, "target": w["id"], "type": "top_cited", "weight": 1})
    return {"nodes": nodes, "edges": edges, "source": "OpenAlex", "message": "Top-cited papers (OpenAlex)"}


@router.get("/topic-graph/{keyword}/cross-ref")
async def topic_cross_ref(keyword: str, n: int = 10):
    """
    Build a cross-reference network among the top-cited papers.
    Edge exists when paper A references paper B inside the same top list.
    """
    works = _top_cited_works(keyword, n)
    index = {w["id"]: w for w in works}
    # nodes
    nodes = [{
        "id": w["id"],
        "label": w["title"] or w["id"],
        "group": "work",
        "meta": {"source": "OpenAlex", "doi": w["doi"], "cited_by": w["cited_by_count"]}
    } for w in works]
    # edges
    edges = []
    for w in works:
        for ref in w["referenced_works"]:
            if ref in index:  # only keep internal links
                edges.append({"source": w["id"], "target": ref, "type": "references", "weight": 1})
    return {"nodes": nodes, "edges": edges, "source": "OpenAlex", "message": "Cross-reference network (OpenAlex)"}



@router.get("/topic-graph/{keyword}/keywords")
async def topic_keywords(keyword: str, n: int = 20):
    """
    Build a keyword co-occurrence graph from top-cited works.
    Nodes = keywords (concept names), edges weighted by co-occurrence counts.
    """
    works = _top_cited_works(keyword, n)
    # collect concepts per work
    import itertools
    concept_counts = {}
    for w in works:
        concepts = sorted(set(w["concepts"] or []))
        # node freq
        for c in concepts:
            concept_counts[c] = concept_counts.get(c, 0) + 1
        # co-occurrence edges
        for a, b in itertools.combinations(concepts, 2):
            key = tuple(sorted((a, b)))
            concept_counts[key] = concept_counts.get(key, 0) + 1

    # build nodes and edges
    nodes = []
    edges = []
    for k, v in concept_counts.items():
        if isinstance(k, tuple):
            a, b = k
            # only keep stronger co-occurrence
            if v >= 2:
                edges.append({"source": a, "target": b, "type": "cooc", "weight": v})
        else:
            # k is already cleaned from _top_cited_works
            nodes.append({"id": k, "label": k, "group": "keyword", "meta": {"count": v}})

    return {"nodes": nodes, "edges": edges, "source": "OpenAlex", "message": "Keyword co-occurrence (OpenAlex)"}