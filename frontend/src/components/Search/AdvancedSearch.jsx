// src/components/search/AdvancedSearch.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function AdvancedSearch({
  advancedFilters,
  setAdvancedFilters,
  onClose,
  onApply,
  onReset,
}) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl z-10">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Search
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              placeholder="e.g., John Smith"
              value={advancedFilters.author}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  author: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year From
              </label>
              <input
                type="number"
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
                value={advancedFilters.yearFrom}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    yearFrom: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year To
              </label>
              <input
                type="number"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
                value={advancedFilters.yearTo}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    yearTo: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Journal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Journal/Conference
            </label>
            <input
              type="text"
              placeholder="e.g., Nature, Science"
              value={advancedFilters.journal}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  journal: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., machine learning, neural networks"
              value={advancedFilters.keywords}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  keywords: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Citation Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Citations
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={advancedFilters.citationMin}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    citationMin: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Citations
              </label>
              <input
                type="number"
                placeholder="10000"
                min="0"
                value={advancedFilters.citationMax}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    citationMax: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Open Access */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="openAccess"
              checked={advancedFilters.openAccess}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  openAccess: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label
              htmlFor="openAccess"
              className="text-sm font-medium text-gray-700"
            >
              Open Access Only
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Clear Filters
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}