// src/components/search/SearchFilters.jsx
import React from 'react';

export default function SearchFilters({ sortBy, setSortBy, source, setSource }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
        >
          <option value="relevance">Most Relevant</option>
          <option value="year">Newest</option>
          <option value="citations">Most Cited</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Source:</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
        >
          <option value="all">All Sources</option>
          <option value="openalex">OpenAlex</option>
          <option value="crossref">CrossRef</option>
          <option value="arxiv">arXiv</option>
        </select>
      </div>
    </div>
  );
}