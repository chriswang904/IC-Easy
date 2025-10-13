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
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [personalized, setPersonalized] = useState(false);

  const { topicImages, loading: imagesLoading } = useTopicImages();

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

  const {
    selectedTopic,
    setSelectedTopic,
    topicMode,
    setTopicMode,
    topicPapers,
    loadingTopic,
  } = useTopicPapers(topicImages);

  const { currentPage, totalPages, currentItems, handlePageChange } =
    usePagination(papers, 10);

  // Function to load user data from localStorage
  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && typeof userData.interests === "string") {
      userData.interests = JSON.parse(userData.interests);
    }
    setUser(userData);

    // Auto-select first interest as topic if user has interests
    if (userData?.interests && userData.interests.length > 0) {
      const firstInterest = userData.interests[0];

      // Map interest names to topic IDs (case-insensitive)
      const interestToTopicMap = {
        AI: "ai",
        "Artificial Intelligence": "ai",
        Biology: "biology",
        Economics: "economics",
        Medicine: "medicine",
        Physics: "physics",
        Environment: "environment",
      };

      const topicId =
        interestToTopicMap[firstInterest] || firstInterest.toLowerCase();
      console.log(
        "[Homepage] Auto-selecting topic based on first interest:",
        firstInterest,
        "→",
        topicId
      );
      setSelectedTopic(topicId);
    }

    return userData;
  };

  // Function to load recommendations
  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      // Get the latest user data before making the API call
      const currentUser = JSON.parse(localStorage.getItem("user"));
      console.log(
        "[Homepage] Loading recommendations for user interests:",
        currentUser?.interests
      );

      const data = await getPersonalizedRecommendations(15);
      setRecommendations(data.results);
      setPersonalized(data.personalized);
      console.log("[Homepage] Recommendations loaded:", {
        total: data.total,
        personalized: data.personalized,
        topics: data.topics,
        results: data.results,
      });
    } catch (err) {
      console.error("[Homepage] Failed to load recommendations:", err);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Initial load on mount + reload on navigation back
  useEffect(() => {
    console.log("[Homepage] Component mounted/re-mounted");
    console.log(
      "[Homepage] Current localStorage user:",
      localStorage.getItem("user")
    );
    console.log(
      "[Homepage] Profile update time:",
      localStorage.getItem("profile_update_time")
    );
    loadUserData();
    loadRecommendations();
  }, []); // This runs every time Homepage mounts

  // Also check for updates when window regains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log("[Homepage] Window focused, checking for profile updates...");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      // Check if user data changed by comparing interests
      if (
        JSON.stringify(currentUser?.interests) !==
        JSON.stringify(user?.interests)
      ) {
        console.log("[Homepage] Profile changed detected, reloading...");
        loadUserData();
        loadRecommendations();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  // Listen for profile updates (works when Homepage is mounted)
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log(
        "[Homepage] Profile updated event received, refreshing data..."
      );
      loadUserData();
      loadRecommendations();
    };

    // Also check on mount if profile was updated while we were away
    const checkForProfileChanges = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const profileUpdateTime = localStorage.getItem("profile_update_time");
      const lastCheckTime = sessionStorage.getItem("homepage_last_check");

      if (
        profileUpdateTime &&
        (!lastCheckTime || profileUpdateTime > lastCheckTime)
      ) {
        console.log(
          "[Homepage] Detected profile update from previous navigation, reloading..."
        );
        loadUserData();
        loadRecommendations();
      }

      // Update last check time
      sessionStorage.setItem("homepage_last_check", Date.now().toString());
    };

    checkForProfileChanges();
    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  // Listen for reset search event AND check for profile updates
  useEffect(() => {
    const handleResetSearch = () => {
      console.log("[Homepage] Logo clicked - resetting to initial page");

      // Check if profile was updated since last check
      const profileUpdateTime = localStorage.getItem("profile_update_time");
      const lastCheckTime = sessionStorage.getItem("homepage_last_check");

      if (
        profileUpdateTime &&
        (!lastCheckTime || profileUpdateTime > lastCheckTime)
      ) {
        console.log(
          "[Homepage] Profile update detected on navigation, reloading..."
        );
        loadUserData();
        loadRecommendations();
        sessionStorage.setItem("homepage_last_check", Date.now().toString());
      }

      resetSearch();
    };
    window.addEventListener("reset-search", handleResetSearch);
    return () => {
      window.removeEventListener("reset-search", handleResetSearch);
    };
  }, [resetSearch]);

  const displayPapers = searchPerformed
    ? currentItems
    : topicPapers.length > 0
    ? topicPapers
    : recommendations.length > 0
    ? recommendations
    : DEFAULT_PAPERS;

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

            {searchPerformed && (
              <SearchFilters
                sortBy={sortBy}
                setSortBy={setSortBy}
                source={source}
                setSource={setSource}
              />
            )}

            <ErrorMessage message={error} />

            {!searchPerformed &&
              !selectedTopic &&
              personalized &&
              user?.interests &&
              Array.isArray(user.interests) &&
              user.interests.length > 0 &&
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
                    </a>{" "}
                    to get personalized recommendations!
                  </p>
                </div>
              )}

            {!searchPerformed && <HeroBanner />}

            {(loading || loadingRecommendations) && (
              <LoadingSpinner
                message={
                  loading
                    ? "Searching for papers..."
                    : "Loading recommendations..."
                }
              />
            )}

            {!searchPerformed && !loading && !loadingRecommendations && (
              <TopicSelector
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                topicMode={topicMode}
                setTopicMode={setTopicMode}
              />
            )}

            {!loading && !loadingRecommendations && (
              <>
                <PaperList
                  papers={displayPapers}
                  onPaperClick={handlePaperClick}
                />
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
