# backend/services/openalex_graph_service.py
import requests
import re
from datetime import datetime
from collections import defaultdict
import urllib.parse

BASE = "https://api.openalex.org"

def clean_html_tags(text: str) -> str:
    """
    Remove HTML tags from text.
    Example: '<i>Ab initio</i>' -> 'Ab initio'
    """
    if not text:
        return ""
    return re.sub(r'<[^>]*>', '', text)


class OpenAlexGraphService:


    def _work_by_doi(self, doi: str):
        # Normalize + encode DOI
        doi = doi.strip().lower().replace("https://doi.org/", "")
        encoded = urllib.parse.quote(f"https://doi.org/{doi}", safe="")
        url = f"{BASE}/works/{encoded}"
        r = requests.get(url, timeout=15)
        if r.status_code != 200:
            print(f"[OpenAlexGraphService] Failed DOI lookup: {url} -> {r.status_code}")
            return None
        return r.json()

    def _works(self, params: dict):
        r = requests.get(f"{BASE}/works", params=params, timeout=20)
        r.raise_for_status()
        return r.json().get("results", [])

    def _authors_works(self, author_id: str, per_page=25):
        # author_id like A1969205039
        params = {"filter": f"authorships.author.id:{BASE}/authors/{author_id}", "per_page": per_page}
        return self._works(params)

    # ---------- Citation Graph ----------
    def build_citation_graph(self, doi: str, max_nodes: int = 60):
        center = self._work_by_doi(doi)
        if not center:
            return {"nodes": [], "edges": []}

        center_id = center["id"]
        center_title = clean_html_tags(center.get("display_name", "Unknown"))
        center_doi = center.get("doi") or doi

        nodes = {}
        edges = []

        def add_node(oid, label, ntype):
            if oid not in nodes:
                # Clean HTML tags from label
                clean_label = clean_html_tags(label or "Untitled")
                nodes[oid] = {"id": oid, "label": clean_label[:120], "type": ntype}

        # center node
        add_node(center_id, center_title, "center")

        # references: center -> reference
        for ref in (center.get("referenced_works") or [])[: max_nodes // 2]:
            ref_url = f"{BASE}/works/{ref}"
            r = requests.get(ref_url, timeout=15)
            if r.status_code != 200: 
                continue
            refw = r.json()
            add_node(refw["id"], refw.get("display_name"), "reference")
            edges.append({"source": center_id, "target": refw["id"], "type": "cites"})

        # cited_by: citing -> center
        params = {"filter": f"cites:{center_id}", "per_page": min(max_nodes // 2, 25)}
        citing = self._works(params)
        for cw in citing:
            add_node(cw["id"], cw.get("display_name"), "cited_by")
            edges.append({"source": cw["id"], "target": center_id, "type": "cited_by"})

        return {"nodes": list(nodes.values()), "edges": edges}

    # ---------- Author Network ----------
    def build_author_network(self, author_id: str, limit: int = 50):
        results = self._authors_works(author_id, per_page=limit)
        co_map = defaultdict(int)
        names = {}

        center = f"{BASE}/authors/{author_id}"
        names[center] = None  # will fill from one of the works if possible

        for w in results:
            for a in w.get("authorships", []):
                aid = a.get("author", {}).get("id")
                aname = clean_html_tags(a.get("author", {}).get("display_name", ""))
                if not aid:
                    continue
                names[aid] = aname or names.get(aid)
            # count co-auth occurrences
            ids = [a.get("author", {}).get("id") for a in w.get("authorships", []) if a.get("author", {}).get("id")]
            for aid in ids:
                if aid != center:
                    co_map[aid] += 1

        nodes = [{"id": center, "label": names.get(center) or "Author", "type": "center"}]
        edges = []
        for aid, cnt in co_map.items():
            nodes.append({"id": aid, "label": names.get(aid) or aid.split("/")[-1], "type": "coauthor", "weight": cnt})
            edges.append({"source": center, "target": aid, "type": "coauthor", "weight": cnt})

        return {"nodes": nodes, "edges": edges}

    # ---------- Topic Trend ----------
    def topic_trend(self, keyword: str, years: int = 10):
        end = datetime.utcnow().year
        start = end - years + 1
        points = []

        # Use OpenAlex search + count for each year
        for y in range(start, end + 1):
            params = {"search": keyword, "filter": f"from_publication_date:{y}-01-01,to_publication_date:{y}-12-31", "per_page": 1}
            r = requests.get(f"{BASE}/works", params=params, timeout=15)
            if r.status_code != 200:
                continue
            meta = r.json().get("meta", {})
            total = meta.get("count", 0)
            points.append({"year": y, "count": total})

        return {"keyword": keyword, "points": points, "range": {"start": start, "end": end}}