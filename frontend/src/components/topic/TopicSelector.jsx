// src/components/topic/TopicSelector.jsx
import React from 'react';
import { TOPICS } from '../../constants/topics';

export default function TopicSelector({
  selectedTopic,
  setSelectedTopic,
  topicMode,
  setTopicMode,
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-6 mb-4">
      <select
        className="border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-purple-500"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
      >
        {TOPICS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded-full border ${
            topicMode === "latest"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
          onClick={() => setTopicMode("latest")}
        >
          Latest
        </button>
        <button
          className={`px-3 py-1 rounded-full border ${
            topicMode === "citations"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
          onClick={() => setTopicMode("citations")}
        >
          Most Cited
        </button>
      </div>
    </div>
  );
}