// src/components/search/SearchBar.jsx
import React from 'react';
import { Clock, SlidersHorizontal, Search, Loader } from 'lucide-react';
import SearchHistory from './SearchHistory';
import AdvancedSearch from './AdvancedSearch';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleSearchChange,
  loading,
  searchHistory,
  showSearchHistory,
  setShowSearchHistory,
  showAdvancedSearch,
  setShowAdvancedSearch,
  advancedFilters,
  setAdvancedFilters,
  resetAdvancedFilters,
  hasActiveFilters,
}) {
  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleClearHistory = () => {
    setShowSearchHistory(false);
  };

  return (
    <div className="relative">
      <div className="mb-6 bg-purple-50 rounded-3xl p-1 flex items-center max-w-2xl">
        <button
          type="button"
          onClick={() => setShowSearchHistory(!showSearchHistory)}
          className="p-3 hover:bg-white/50 rounded-full"
          aria-label="Recent"
        >
          <Clock className="w-6 h-6 text-gray-600" />
        </button>
        <input
          type="search"
          placeholder="Search papers, topics, or authors..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() =>
            searchHistory.length > 0 && setShowSearchHistory(true)
          }
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700"
          aria-label="Search"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className={`p-3 hover:bg-white/50 rounded-full relative ${
            hasActiveFilters ? "bg-purple-200" : ""
          }`}
          aria-label="Advanced Search"
          title="Advanced Search"
        >
          <SlidersHorizontal className="w-6 h-6 text-gray-600" />
          {hasActiveFilters && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
          )}
        </button>
        <button
          type="button"
          onClick={handleSearch}
          className="p-3 hover:bg-white/50 rounded-full disabled:opacity-50"
          aria-label="Search"
          disabled={loading}
        >
          {loading ? (
            <Loader className="w-6 h-6 text-gray-600 animate-spin" />
          ) : (
            <Search className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Search History Dropdown */}
      {showSearchHistory && searchHistory.length > 0 && (
        <SearchHistory
          searchHistory={searchHistory}
          onHistoryClick={handleHistoryClick}
          onClearAll={handleClearHistory}
        />
      )}

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <AdvancedSearch
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
          onClose={() => setShowAdvancedSearch(false)}
          onApply={handleSearch}
          onReset={resetAdvancedFilters}
        />
      )}
    </div>
  );
}