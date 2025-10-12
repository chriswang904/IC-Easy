// src/pages/Homepage.jsx
import React, { useEffect, useState } from "react";
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
import { getPersonalizedRecommendations } from "../api/recommendations";
import { getStoredUser } from "../api/auth";
import { Sparkles } from "lucide-react";

export default function Homepage() {
  // User state
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [personalized, setPersonalized] = useState(false);

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
    resetSearch,
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

  // ✅ Load user and personalized recommendations on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    // Load personalized recommendations
    loadRecommendations();
  }, []);

  // ✅ Function to load personalized recommendations
  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const data = await getPersonalizedRecommendations(15);
      setRecommendations(data.results);
      setPersonalized(data.personalized);
      console.log("[Homepage] Recommendations loaded:", {
        total: data.total,
        personalized: data.personalized,
        topics: data.topics,
      });
    } catch (err) {
      console.error("[Homepage] Failed to load recommendations:", err);
      // If recommendations fail, fall back to default papers
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Handle reset search event
  useEffect(() => {
    const handleResetSearch = () => {
      console.log("[Homepage] Logo clicked - resetting to initial page");
      resetSearch();
    };

    window.addEventListener("reset-search", handleResetSearch);

    return () => {
      window.removeEventListener("reset-search", handleResetSearch);
    };
  }, [resetSearch]);

  // ❌ REMOVED: The useEffect that redirects to /welcome
  // This is now handled in Login.jsx after successful login

  // ✅ Determine which papers to display
  const displayPapers = searchPerformed
    ? currentItems // Search results
    : topicPapers.length > 0
    ? topicPapers // Topic-specific papers
    : recommendations.length > 0
    ? recommendations // Personalized recommendations
    : DEFAULT_PAPERS; // Fallback to default papers

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

            {/* ✅ Personalization Notice - Show when displaying recommendations */}
            {!searchPerformed && 
             !selectedTopic && 
             personalized && 
             user?.interests && 
             recommendations.length > 0 && (
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-purple-800 font-medium mb-2">
                    📚 Personalized recommendations based on your interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ No interests prompt */}
            {!searchPerformed && 
             !selectedTopic && 
             user && 
             (!user.interests || user.interests.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  💡 <strong>Tip:</strong> Set your interests in your{" "}
                  <a
                    href="/profile"
                    className="text-purple-600 hover:text-purple-700 underline font-medium"
                  >
                    profile
                  </a>
                  {" "}to get personalized recommendations!
                </p>
              </div>
            )}

            {/* Hero Banner (only show when no search) */}
            {!searchPerformed && <HeroBanner />}

            {/* Loading Spinner */}
            {(loading || loadingRecommendations) && (
              <LoadingSpinner 
                message={loading ? "Searching for papers..." : "Loading recommendations..."} 
              />
            )}

            {/* Topic Selector (only show when no search) */}
            {!searchPerformed && !loading && !loadingRecommendations && (
              <TopicSelector
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                topicMode={topicMode}
                setTopicMode={setTopicMode}
              />
            )}

            {/* Paper List */}
            {!loading && !loadingRecommendations && (
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