// frontend/src/components/knowledge/CitationGraph.jsx
import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { getCitationGraph } from "../../api/knowledge";

export default function CitationGraph() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [doi, setDoi] = useState("10.1038/s41586-024-00001");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCitationGraph(doi, 60);
      setGraph({ nodes: data.nodes, edges: data.edges });
    } catch (e) {
      console.error("[CitationGraph] failed:", e);
      setGraph({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="border rounded-lg p-2 flex-1"
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
          placeholder="Enter DOI, e.g., 10.xxxx/xxxxx"
        />
        <button onClick={load} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          {loading ? "Loading..." : "Render"}
        </button>
      </div>

      <div className="border rounded-lg">
        <ForceGraph2D
          width={1000}
          height={640}
          graphData={{ nodes: graph.nodes, links: graph.edges }}
          nodeLabel={(n) => `${n.type}: ${n.label}`}
          nodeAutoColorBy="type"
          linkDirectionalArrowLength={5}
          linkColor={() => "rgba(120,120,120,0.6)"}
        />
      </div>
    </div>
  );
}
