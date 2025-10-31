import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "../api/client";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Debounce helper
 */
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], message: null });
  const [trendData, setTrendData] = useState({ points: [], message: null }); // for topic trend if needed
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [graphType, setGraphType] = useState("topic"); // default to Topic mode
  const [topicTab, setTopicTab] = useState("top"); // 'top' | 'cross' | 'keywords'
  const [source, setSource] = useState("auto"); // for citation only
  const [input, setInput] = useState(""); // clear by default

  const [selectedNode, setSelectedNode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // author autocomplete
  const [authorQuery, setAuthorQuery] = useState("");
  const dq = useDebounce(authorQuery, 300);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [showAuthorDrop, setShowAuthorDrop] = useState(false);

  const placeholder = useMemo(() => {
    if (graphType === "citation") return "Enter DOI (e.g. 10.1038/s41586-022-04823-6)";
    if (graphType === "author") return "Enter author name or OpenAlex ID (e.g. A1969205039)";
    return "Enter keyword (e.g. AI, quantum, genetics)";
  }, [graphType]);

  // fetch helpers
  const fetchGraph = async (value) => {
    setLoading(true);
    setError(null);
    setGraphData({ nodes: [], edges: [], message: null });
    setSelectedNode(null);
    try {
      let url = "";
      if (graphType === "citation") {
        const normalized = value.trim().replace(/^https?:\/\/doi\.org\//, "");
        url =
          source === "auto"
            ? `/api/knowledge/citation-graph/${encodeURIComponent(normalized)}?max_nodes=60`
            : `/api/knowledge/citation-graph/${encodeURIComponent(normalized)}?max_nodes=60&use=${source}`;
        const res = await apiClient.get(url);
        setGraphData(res.data);
      } else if (graphType === "author") {
        // allow either name or ID; if it's not starting with 'A', do a search first and pick the first
        let authorId = value.trim();
        if (!authorId.startsWith("A")) {
          const r = await apiClient.get(`/api/knowledge/openalex/author-search?name=${encodeURIComponent(authorId)}`);
          const first = (r.data || [])[0];
          if (!first) throw new Error("No author found for your query.");
          authorId = first.id;
        }
        const res = await apiClient.get(`/api/knowledge/author-network/${authorId}?limit=50`);
        setGraphData(res.data);
      } else if (graphType === "topic") {
        if (topicTab === "top") {
          const res = await apiClient.get(`/api/knowledge/topic-graph/${encodeURIComponent(value)}/top-cited?n=10`);
          setGraphData(res.data);
        } else if (topicTab === "cross") {
          const res = await apiClient.get(`/api/knowledge/topic-graph/${encodeURIComponent(value)}/cross-ref?n=10`);
          setGraphData(res.data);
        } else if (topicTab === "keywords") {
          const res = await apiClient.get(`/api/knowledge/topic-graph/${encodeURIComponent(value)}/keywords?n=20`);
          setGraphData(res.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "No data available for this input.");
    } finally {
      setLoading(false);
    }
  };

  // author autocomplete: when typing a name (no 'A' prefix), query suggestions
  useEffect(() => {
    if (graphType !== "author") return;
    const q = dq.trim();
    if (!q || q.startsWith("A")) {
      setAuthorOptions([]);
      return;
    }
    (async () => {
      try {
        const r = await apiClient.get(`/api/knowledge/openalex/author-search?name=${encodeURIComponent(q)}`);
        setAuthorOptions(r.data || []);
        setShowAuthorDrop(true);
      } catch {
        setAuthorOptions([]);
      }
    })();
  }, [dq, graphType]);

  // clear input and graph when switching mode
  const onGraphTypeChange = (val) => {
    setGraphType(val);
    setInput("");
    setAuthorQuery("");
    setAuthorOptions([]);
    setGraphData({ nodes: [], edges: [], message: null });
    setTopicTab("top"); // default tab
  };

  // auto-search when switching topic tabs if input exists
  useEffect(() => {
    if (graphType === "topic" && input.trim()) {
      fetchGraph(input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicTab]);

  // render

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Knowledge Graph</h1>

      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-3 w-full">
        {/* Fixed label */}
        <span className="text-gray-700 font-medium whitespace-nowrap">
          Graph Type:
        </span>

        {/* Dropdown for mode */}
        <select
            value={graphType}
            onChange={(e) => onGraphTypeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
        >
            <option value="citation">Citation Graph</option>
            <option value="author">Author Network</option>
            <option value="topic">Topic Exploration</option>
        </select>

        {/* Only for citation: source selector */}
        {graphType === "citation" && (
            <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            >
            <option value="auto">Auto (Try best source)</option>
            <option value="coci">COCI (OpenCitations)</option>
            <option value="openalex">OpenAlex</option>
            <option value="lens">Lens.org</option>
            </select>
        )}

        {/* Input without label */}
        <div className="flex-1 min-w-[340px]">
            <div className="relative">
            <input
                type="text"
                value={graphType === "author" ? authorQuery || input : input}
                onChange={(e) => {
                if (graphType === "author") {
                    setAuthorQuery(e.target.value);
                    setInput(e.target.value);
                } else {
                    setInput(e.target.value);
                }
                }}
                placeholder={placeholder}
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-purple-400"
                onFocus={() => graphType === "author" && setShowAuthorDrop(true)}
                onBlur={() => setTimeout(() => setShowAuthorDrop(false), 120)}
            />
            {/* author suggestions */}
            {graphType === "author" && showAuthorDrop && authorOptions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border rounded-lg shadow mt-1 max-h-72 overflow-auto">
                {authorOptions.map((opt) => (
                    <div
                    key={opt.id}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => {
                        setAuthorQuery(opt.name);
                        setInput(opt.id);
                        setShowAuthorDrop(false);
                    }}
                    >
                    <div className="font-medium">{opt.name}</div>
                    <div className="text-gray-500 text-xs">
                        ID: {opt.id} • Works: {opt.works_count} • Cited-by: {opt.cited_by_count}
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>

        {/* Search button */}
        <button
            onClick={() => fetchGraph(input)}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap"
        >
            Search
        </button>
        </div>


      {/* Helper text to tell users what to enter */}
      <div className="text-gray-500 text-sm">
        {graphType === "citation" && <p>Enter a DOI to view its citation network.</p>}
        {graphType === "author" && <p>Type an author name to pick from suggestions, or paste an OpenAlex author ID starting with "A".</p>}
        {graphType === "topic" && (
          <p>
            Enter a keyword to explore: Top-cited papers (default), cross-references among them, or keyword co-occurrence.
          </p>
        )}
      </div>

      {/* Topic sub-tabs */}
      {graphType === "topic" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {["top", "cross", "keywords"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setTopicTab(tab);
                  setGraphData({ nodes: [], edges: [], message: null });
                }}
                className={`px-3 py-1 rounded-lg border ${
                  topicTab === tab ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700"
                }`}
              >
                {tab === "top" && "🏆 Top-Cited Papers"}
                {tab === "cross" && "🔗 Cross-Reference"}
                {tab === "keywords" && "💬 Keyword Co-occurrence"}
              </button>
            ))}
          </div>
          {/* Mode descriptions */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            {topicTab === "top" && (
              <p><strong>Mind-map style:</strong> Shows the most cited papers for your keyword. The center is your topic, surrounding nodes are influential papers.</p>
            )}
            {topicTab === "cross" && (
              <p><strong>Citation network:</strong> Reveals how top papers cite each other. See which papers form the theoretical foundation of this field.</p>
            )}
            {topicTab === "keywords" && (
              <p><strong>Concept network:</strong> Displays frequently co-occurring keywords. Node size indicates frequency. Discover related sub-topics and research directions.</p>
            )}
          </div>
        </div>
      )}

      {/* status */}
      {loading && <p className="text-gray-500">Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* message */}
      {graphData.message && (
        <div
          className={`p-2 rounded-lg ${
            graphData.message.includes("Data from") ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {graphData.message}
        </div>
      )}

      {/* Graphs */}
      {!loading && (graphType === "citation" || graphType === "author" || topicTab !== "trend") && graphData.nodes?.length > 0 && (
        <div className="border rounded-lg shadow-sm p-2 bg-white flex justify-center relative z-0">
          <ForceGraph2D
            graphData={{ 
              nodes: graphData.nodes.map(node => ({
                ...node,
                // Add random initial positions to spread nodes - increased range
                x: node.x || (Math.random() - 0.5) * 800,
                y: node.y || (Math.random() - 0.5) * 800,
              })), 
              links: graphData.edges 
            }}
            nodeLabel={(node) => {
              // Strip HTML tags from label for tooltip
              const cleanLabel = (node.label || "").replace(/<[^>]*>/g, '');
              return `${cleanLabel}\nSource: ${node.meta?.source || "Unknown"}${
                node.meta?.doi ? `\nDOI: ${node.meta.doi}` : ""
              }${node.meta?.cited_by ? `\nCited-by: ${node.meta.cited_by}` : ""}${
                node.meta?.count ? `\nFrequency: ${node.meta.count}` : ""
              }`;
            }}
            nodeAutoColorBy="group"
            onNodeClick={(node) => {
              setSelectedNode(node);
              setShowModal(true);
            }}
            linkDirectionalArrowLength={3}
            width={Math.min(window.innerWidth - 150, 1200)}
            height={600}
            // Optimize physics for better spread
            d3VelocityDecay={0.5}
            d3AlphaDecay={0.015}
            d3AlphaMin={0.001}
            cooldownTicks={200}
            warmupTicks={80}
            // Much stronger repulsion force for keyword graphs
            d3Force={{
              charge: { 
                strength: topicTab === "keywords" ? -400 : -250,
                distanceMax: 500
              },
              link: { 
                distance: topicTab === "keywords" ? 120 : 80,
                strength: 0.5
              },
              collision: {
                radius: (node) => {
                  const radius = node.meta?.count ? Math.min(6 + node.meta.count, 20) : 6;
                  return radius + 30; // Add collision buffer
                },
                strength: 0.8
              }
            }}
            // Draw nodes with custom canvas rendering
            nodeCanvasObject={(node, ctx, globalScale) => {
              const cleanLabel = (node.label || "").replace(/<[^>]*>/g, '');
              const fontSize = 12 / globalScale;
              // draw circle with size by meta.count (only for keyword nodes)
              const radius = node.meta?.count ? Math.min(6 + node.meta.count, 20) : 6;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color || "#888";
              ctx.fill();
              
              // Draw label with better positioning to reduce overlap
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "black";
              
              // Position label outside the node
              const labelX = node.x;
              const labelY = node.y - radius - 10;
              
              // Add white background for better readability
              const textWidth = ctx.measureText(cleanLabel).width;
              ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
              ctx.fillRect(labelX - textWidth / 2 - 3, labelY - fontSize / 2 - 2, textWidth + 6, fontSize + 4);
              
              // Draw text
              ctx.fillStyle = "black";
              ctx.fillText(cleanLabel, labelX, labelY);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              // Make the clickable area include the text label
              const cleanLabel = (node.label || "").replace(/<[^>]*>/g, '');
              const fontSize = 12;
              const radius = node.meta?.count ? Math.min(6 + node.meta.count, 20) : 6;
              
              // Draw larger clickable area
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.fill();
              
              // Add clickable area for text
              const textWidth = ctx.measureText(cleanLabel).width;
              const labelY = node.y - radius - 10;
              ctx.fillRect(node.x - textWidth / 2 - 3, labelY - fontSize / 2 - 2, textWidth + 6, fontSize + 4);
            }}
          />
        </div>
      )}

      {/* Topic trend chart kept for future switch if needed */}
      {!loading && graphType === "topic" && topicTab === "trend" && trendData.points?.length > 0 && (
        <div className="border rounded-lg shadow-sm p-4 bg-white">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData.points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* empty state */}
      {!loading && !error && graphData.nodes?.length === 0 && graphType !== "topic" && (
        <p className="text-gray-400 text-center mt-10">No data available for this input.</p>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-[440px] space-y-3"
            >
              <h2 className="text-lg font-semibold">Node Details</h2>
              <p><strong>Title:</strong> {(selectedNode.label || "").replace(/<[^>]*>/g, '')}</p>
              <p><strong>Source:</strong> {selectedNode.meta?.source || "Unknown"}</p>
              <p><strong>DOI:</strong> {selectedNode.meta?.doi || "N/A"}</p>
              {"cited_by" in (selectedNode.meta || {}) && (
                <p><strong>Cited-by:</strong> {selectedNode.meta.cited_by}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => window.open(selectedNode.id, "_blank", "noopener,noreferrer")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Open in Source
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}