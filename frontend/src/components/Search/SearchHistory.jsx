// src/components/search/SearchHistory.jsx
import React from 'react';
import { Clock } from 'lucide-react';

export default function SearchHistory({
  searchHistory,
  onHistoryClick,
  onClearAll,
}) {
  if (searchHistory.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl z-10">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Searches
          </h3>
          <button
            onClick={onClearAll}
            className="text-xs text-purple-600 hover:text-purple-700"
          >
            Clear All
          </button>
        </div>
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {searchHistory.map((query, index) => (
          <li key={index}>
            <button
              onClick={() => onHistoryClick(query)}
              className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 transition"
            >
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 flex-1">{query}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}