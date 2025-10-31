# backend/services/lens_service.py
import requests
import re
import logging

logger = logging.getLogger(__name__)

def clean_html_tags(text: str) -> str:
    """
    Remove HTML tags from text.
    Example: '<i>Ab initio</i>' -> 'Ab initio'
    """
    if not text:
        return ""
    return re.sub(r'<[^>]*>', '', text)


class LensService:
    BASE_URL = "https://api.lens.org/scholarly/search"

    def get_citation_graph(self, doi: str, max_nodes: int = 60):
        headers = {"Accept": "application/json"}
        query = {"query": {"term": {"ids.doi": doi}}, "size": 1}
        resp = requests.post(self.BASE_URL, json=query, headers=headers, timeout=10)
        if resp.status_code != 200:
            return None

        data = resp.json().get("data", [])
        if not data:
            return None

        paper = data[0]
        nodes = [{"id": doi, "label": clean_html_tags(paper.get("title", doi)), "group": "paper"}]
        edges = []

        # Citations
        for c in paper.get("citations", [])[:max_nodes]:
            nodes.append({
                "id": c.get("doi", c.get("id")), 
                "label": clean_html_tags(c.get("title", "Cited")), 
                "group": "citation"
            })
            edges.append({"source": doi, "target": c.get("doi", c.get("id"))})

        # References
        for r in paper.get("references", [])[:max_nodes]:
            nodes.append({
                "id": r.get("doi", r.get("id")), 
                "label": clean_html_tags(r.get("title", "Ref")), 
                "group": "ref"
            })
            edges.append({"source": r.get("doi", r.get("id")), "target": doi})

        return {"nodes": nodes, "edges": edges}