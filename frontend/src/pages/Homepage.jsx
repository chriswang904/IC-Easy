// src/pages/Homepage.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/search/SearchBar";
import SearchFilters from "../components/search/SearchFilters";
import TopicSelector from "../components/topic/TopicSelector";
import HeroBanner from "../components/topic/HeroBanner";
import PaperList from "../components/paper/PaperList";
import PaperPagination from "../components/paper/PaperPagination";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";

import { useTopicImages } from "../hooks/useTopicImages";
import { useSearch } from "../hooks/useSearch";
import { useTopicPapers } from "../hooks/useTopicPapers";
import { usePagination } from "../hooks/usePagination";

import { DEFAULT_PAPERS } from "../constants/topics";

export default function Homepage() {
  // Load topic images first
  const { topicImages, loading: imagesLoading } = useTopicImages();

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    sortBy,
    setSortBy,
    source,
    setSource,
    papers,
    loading,
    error,
    searchPerformed,
    searchHistory,
    showSearchHistory,
    setShowSearchHistory,
    showAdvancedSearch,
    setShowAdvancedSearch,
    advancedFilters,
    setAdvancedFilters,
    handleSearch,
    resetAdvancedFilters,
    hasActiveFilters,
    totalResults,
  } = useSearch(topicImages);

  // Topic papers functionality
  const {
    selectedTopic,
    setSelectedTopic,
    topicMode,
    setTopicMode,
    topicPapers,
    loadingTopic,
  } = useTopicPapers(topicImages);

  // Pagination
  const {
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
  } = usePagination(papers, 10);

  // Determine which papers to display
  const displayPapers = searchPerformed
    ? currentItems
    : topicPapers.length > 0
    ? topicPapers
    : DEFAULT_PAPERS;

  // Handle paper click
  const handlePaperClick = (paper) => {
    console.log("[Homepage] Paper clicked:", paper);
    if (paper.url) {
      window.open(paper.url, "_blank");
    }
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex justify-center items-start p-6">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 w-[90%] max-w-6xl min-h-screen">
            
            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              handleSearchChange={handleSearchChange}
              loading={loading}
              searchHistory={searchHistory}
              showSearchHistory={showSearchHistory}
              setShowSearchHistory={setShowSearchHistory}
              showAdvancedSearch={showAdvancedSearch}
              setShowAdvancedSearch={setShowAdvancedSearch}
              advancedFilters={advancedFilters}
              setAdvancedFilters={setAdvancedFilters}
              resetAdvancedFilters={resetAdvancedFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Search Filters (only show when search is performed) */}
            {searchPerformed && (
              <SearchFilters
                sortBy={sortBy}
                setSortBy={setSortBy}
                source={source}
                setSource={setSource}
              />
            )}

            {/* Error Message */}
            <ErrorMessage message={error} />

            {/* Hero Banner (only show when no search) */}
            {!searchPerformed && <HeroBanner />}

            {/* Loading Spinner */}
            {loading && <LoadingSpinner message="Searching for papers..." />}

            {/* Topic Selector (only show when no search) */}
            {!searchPerformed && !loading && (
              <TopicSelector
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                topicMode={topicMode}
                setTopicMode={setTopicMode}
              />
            )}

            {/* Paper List */}
            {!loading && (
              <>
                <PaperList
                  papers={displayPapers}
                  onPaperClick={handlePaperClick}
                />

                {/* Pagination (only for search results) */}
                {searchPerformed && papers.length > 0 && (
                  <PaperPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={totalResults}
                    currentItems={currentItems}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}