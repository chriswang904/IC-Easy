// frontend/src/components/knowledge/AuthorNetworkGraph.jsx
import React, { useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { getAuthorNetwork } from "../../api/knowledge";

export default function AuthorNetworkGraph() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [authorId, setAuthorId] = useState("A1969205039");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAuthorNetwork(authorId, 60);
      setGraph({ nodes: data.nodes, edges: data.edges });
    } catch (e) {
      console.error("[AuthorNetwork] failed:", e);
      setGraph({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="border rounded-lg p-2 flex-1"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          placeholder="OpenAlex Author ID, e.g., A1969205039"
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
        />
      </div>
    </div>
  );
}
