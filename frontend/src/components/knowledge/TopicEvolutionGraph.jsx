// frontend/src/components/knowledge/TopicEvolutionGraph.jsx
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { getTopicEvolution } from "../../api/knowledge";

export default function TopicEvolutionGraph() {
  const [keyword, setKeyword] = useState("artificial intelligence");
  const [years, setYears] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTopicEvolution(keyword, years);
      setData(res.points || []);
    } catch (e) {
      console.error("[TopicEvolution] failed:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="border rounded-lg p-2 flex-1"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword, e.g., artificial intelligence"
        />
        <input
          type="number"
          className="border rounded-lg p-2 w-28"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          min={3}
          max={30}
        />
        <button onClick={load} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          {loading ? "Loading..." : "Render"}
        </button>
      </div>

      <div className="border rounded-lg p-3 h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
