import requests, logging

logger = logging.getLogger(__name__)

class COCIService:
    BASE_URL = "https://opencitations.net/index/coci/api/v1"

    def get_citation_graph(self, doi: str, max_nodes: int = 60):
        nodes = [{"id": doi, "label": doi, "group": "paper"}]
        edges = []

        # Get papers that CITE this DOI
        cites = requests.get(f"{self.BASE_URL}/citations/{doi}", timeout=10)
        if cites.status_code == 200:
            for c in cites.json()[:max_nodes]:
                citing = c.get("citing")
                if citing:
                    nodes.append({"id": citing, "label": citing, "group": "citation"})
                    edges.append({"source": citing, "target": doi})

        #  Get papers this DOI REFERENCES
        refs = requests.get(f"{self.BASE_URL}/references/{doi}", timeout=10)
        if refs.status_code == 200:
            for r in refs.json()[:max_nodes]:
                cited = r.get("cited")
                if cited:
                    nodes.append({"id": cited, "label": cited, "group": "ref"})
                    edges.append({"source": doi, "target": cited})

        if len(nodes) > 1:
            return {"nodes": nodes, "edges": edges}
        return None
