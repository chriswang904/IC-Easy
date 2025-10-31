// src/pages/SearchResultPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/search/SearchBar";
import SearchFilters from "../components/search/SearchFilters";
import PaperList from "../components/paper/PaperList";
import PaperPagination from "../components/paper/PaperPagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { usePagination } from "../hooks/usePagination";
import { useTopicImages } from "../hooks/useTopicImages";
import { useSearch } from "../hooks/useSearch";
import SelectCollectionDialog from "../components/collections/SelectCollectionDialog";
import { useCollections } from "../hooks/useCollections";

export default function SearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { topicImages } = useTopicImages();

  // Retrieve the search results passed from Homepage
  const {
    papers: initialPapers,
    totalResults: initialTotalResults,
    sortBy: initialSortBy,
    source: initialSource,
    searchQuery: initialSearchQuery,
  } = location.state || {};

  const { addToCollection } = useCollections();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Use the useSearch hook to manage all search-related states and functions
  const {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    sortBy,
    setSortBy,
    source,
    setSource,
    papers: newSearchPapers,
    loading,
    error,
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
    totalResults: newTotalResults,
  } = useSearch(topicImages);

  // Manage displayed papers (either initial results or new search results)
  const [displayPapers, setDisplayPapers] = useState(initialPapers || []);
  const [displayTotalResults, setDisplayTotalResults] = useState(initialTotalResults || 0);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(initialSearchQuery || "");

  // Filtered papers
  const [filteredPapers, setFilteredPapers] = useState(displayPapers);

  // Pagination
  const { currentPage, totalPages, currentItems, handlePageChange } = usePagination(
    filteredPapers,
    10
  );

  // Initialize: set sortBy and source to initial values if provided
  useEffect(() => {
    if (initialSortBy) setSortBy(initialSortBy);
    if (initialSource) setSource(initialSource);
    if (initialSearchQuery) setSearchQuery(initialSearchQuery);
  }, []);

  // Listen for new search results (when searching again within SearchResultPage)
  useEffect(() => {
    if (newSearchPapers && newSearchPapers.length > 0) {
      console.log("[SearchResultPage] New search completed, updating results");
      setDisplayPapers(newSearchPapers);
      setDisplayTotalResults(newTotalResults);
      setCurrentSearchQuery(searchQuery);
    }
  }, [newSearchPapers, newTotalResults, searchQuery]);

  // Apply filters and sorting
  useEffect(() => {
    if (!displayPapers || displayPapers.length === 0) return;

    let filtered = [...displayPapers];

    // Filter by source
    if (source !== "all") {
      filtered = filtered.filter((paper) => paper.source === source);
    }

    // Sort results
    if (sortBy === "date") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.published || a.metadata || 0);
        const dateB = new Date(b.published || b.metadata || 0);
        return dateB - dateA;
      });
    } else if (sortBy === "citations") {
      filtered.sort((a, b) => (b.citations || 0) - (a.citations || 0));
    }

    setFilteredPapers(filtered);
  }, [sortBy, source, displayPapers]);

  // Handle paper click
  const handlePaperClick = (paper) => {
    console.log("[SearchResultPage] Paper clicked:", paper);
    if (paper.url) {
      window.open(paper.url, "_blank");
    }
  };

  // Show message if no search results found
  if (!displayPapers || displayPapers.length === 0) {
    return (
      <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex justify-center items-start p-6">
            <div className="text-center w-full mt-20">
              <p className="text-gray-600 mb-4">No search results found.</p>
              <button
                onClick={() => navigate("/")}
                className="text-purple-600 hover:text-purple-700 underline font-medium"
              >
                Back to Explore
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex justify-center items-start p-6">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 w-[90%] max-w-6xl min-h-screen">
            {/* Search bar with full props */}
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

            {/* Back button and title */}
            <div className="mb-6 mt-4">
              <h1 className="text-2xl font-bold text-purple-700">
                Search Results for "{currentSearchQuery}"
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    Found <strong>{filteredPapers.length}</strong> of {displayTotalResults} papers
                </p>
                
                <SearchFilters
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    source={source}
                    setSource={setSource}
                />
                </div>
            </div>

            {/* Loading spinner */}
            {loading && <LoadingSpinner message="Searching for papers..." />}

            {/* Paper list and pagination */}
            {!loading && filteredPapers.length > 0 ? (
              <>
                <PaperList papers={currentItems} onPaperClick={handlePaperClick} />
                <PaperPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={filteredPapers.length}
                  currentItems={currentItems}
                  onPageChange={handlePageChange}
                />
              </>
            ) : !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found with the current filters.</p>
                <button
                  onClick={() => {
                    setSource("all");
                    setSortBy("relevance");
                  }}
                  className="mt-4 text-purple-600 hover:text-purple-700 underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : null}

            <SelectCollectionDialog
              isOpen={showDialog}
              onClose={() => setShowDialog(false)}
              onConfirm={(subjectId, groupId) => {
                addToCollection(selectedPaper, subjectId, groupId);
                setShowDialog(false);
              }}
            />
          </article>
        </div>
      </div>
    </main>
  );
}
