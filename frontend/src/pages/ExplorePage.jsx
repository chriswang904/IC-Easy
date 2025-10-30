// src/pages/Homepage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/search/SearchBar";
import TopicSelector from "../components/topic/TopicSelector";
import HeroBanner from "../components/topic/HeroBanner";
import PaperList from "../components/paper/PaperList";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";

import { useTopicImages } from "../hooks/useTopicImages";
import { useSearch } from "../hooks/useSearch";
import { useTopicPapers } from "../hooks/useTopicPapers";

import { DEFAULT_PAPERS } from "../constants/topics";
import { getPersonalizedRecommendations } from "../api/recommendations";
import { Sparkles } from "lucide-react";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [personalized, setPersonalized] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false); // ✅ 添加导航标记

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
    searchHistory,
    showSearchHistory,
    setShowSearchHistory,
    showAdvancedSearch,
    setShowAdvancedSearch,
    advancedFilters,
    setAdvancedFilters,
    handleSearch: originalHandleSearch,
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


  const handleSearch = async () => {
    setShouldNavigate(true);
    await originalHandleSearch();
  };

  useEffect(() => {
    console.log("[ExplorePage] papers before navigate:", papers);
    console.log("[ExplorePage] loading:", loading);

    if (shouldNavigate && Array.isArray(papers) && papers.length > 0 && !loading) {
      console.log("[ExplorePage] Navigating to search results with papers:", papers.length);
      navigate(`/search-results?query=${encodeURIComponent(searchQuery)}`, {
        state: {
          papers,
          totalResults,
          sortBy,
          source,
          searchQuery,
        },
      });
      setShouldNavigate(false);
    }
  }, [shouldNavigate, papers, loading, navigate, totalResults, sortBy, source, searchQuery]);

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

  // Profile update listener
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log("[Homepage] Detected profile-updated event, refreshing...");
      loadUserData();
      loadRecommendations();
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  // Initial load on mount
  useEffect(() => {
    console.log("[Homepage] Component mounted/re-mounted");
    loadUserData();
    loadRecommendations();
  }, []);

  // Check for updates when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log("[Homepage] Window focused, checking for profile updates...");
      const currentUser = JSON.parse(localStorage.getItem("user"));

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

  // Check for profile updates on mount
  useEffect(() => {
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

      sessionStorage.setItem("homepage_last_check", Date.now().toString());
    };

    checkForProfileChanges();
  }, []);

  // Listen for reset search event
  useEffect(() => {
    const handleResetSearch = () => {
      console.log("[Homepage] Logo clicked - resetting to initial page");

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

  // Determine which papers to display (no search results here anymore)
  const displayPapers =
    topicPapers.length > 0
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
            {/* Search Bar - for initiating searches */}
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

            {/* Error Message */}
            <ErrorMessage message={error} />

            {/* Personalized Recommendations Banner */}
            {personalized &&
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

            {/* Tip for users without interests */}
            {user &&
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
            {/* Hero Banner */}
            <HeroBanner />

            {/* Loading Spinner */}
            {(loading || loadingRecommendations) && (
              <LoadingSpinner
                message={
                  loading
                    ? "Searching for papers..."
                    : "Loading recommendations..."
                }
              />
            )}

            {/* Topic Selector */}
            {!loading && !loadingRecommendations && (
              <TopicSelector
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                topicMode={topicMode}
                setTopicMode={setTopicMode}
              />
            )}

            {/* Paper List - Only shows recommendations/topic papers, NOT search results */}
            {!loading && !loadingRecommendations && (
              <PaperList
                papers={displayPapers}
                onPaperClick={handlePaperClick}
              />
            )}
          </article>
        </div>
      </div>
    </main>
  );
}