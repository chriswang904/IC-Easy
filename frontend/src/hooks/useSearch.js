// src/hooks/useSearch.js
import { useState, useEffect } from 'react'; 
import { searchLiterature, getErrorMessage } from '../api';
import { transformPaper, detectTopicFromKeyword } from '../utils/paperTransformer';
import { deduplicatePapers } from '../utils/deduplication';

export function useSearch(topicImages) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [source, setSource] = useState("all");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [advancedFilters, setAdvancedFilters] = useState({
    author: "",
    yearFrom: "",
    yearTo: "",
    journal: "",
    keywords: "",
    citationMin: "",
    citationMax: "",
    openAccess: false,
  });

  useEffect(() => {
    if (searchPerformed && searchQuery.trim()) {
      console.log("[useSearch] sortBy or source changed, re-searching...");
      handleSearch();
    }
  }, [sortBy, source]);

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    // Add to search history
    setSearchHistory((prev) => {
      const newHistory = [
        searchQuery,
        ...prev.filter((q) => q !== searchQuery),
      ];
      return newHistory.slice(0, 10);
    });

    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setShowSearchHistory(false);

    // Detect topic for images
    const topicKey = detectTopicFromKeyword(searchQuery);
    let topicImagesList = topicImages[topicKey] || topicImages["ai"] || [
      "/images/note1.jpg",
      "/images/note2.jpg",
      "/images/note3.jpg",
    ];

    console.log("[useSearch] Using topicKey:", topicKey);
    console.log("[useSearch] Using images:", topicImagesList);

    try {
      const filters = {};
      if (advancedFilters.author) filters.author = advancedFilters.author;
      if (advancedFilters.yearFrom) filters.year_from = parseInt(advancedFilters.yearFrom);
      if (advancedFilters.yearTo) filters.year_to = parseInt(advancedFilters.yearTo);
      if (advancedFilters.journal) filters.journal = advancedFilters.journal;
      if (advancedFilters.keywords) {
        filters.keywords = advancedFilters.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
      }
      if (advancedFilters.citationMin) filters.citation_min = parseInt(advancedFilters.citationMin);
      if (advancedFilters.citationMax) filters.citation_max = parseInt(advancedFilters.citationMax);
      if (advancedFilters.openAccess) filters.open_access = true;

      const result = await searchLiterature({
        keyword: searchQuery,
        limit: 50,
        source,
        sort_by: sortBy,
        filters: Object.keys(filters).length > 0 ? filters : null,
      });

      console.log("[useSearch] API results:", result.results?.length || 0);

      // Transform papers
      const transformedPapers = (result.results || []).map((paper, index) =>
        transformPaper(paper, index, topicImagesList)
      );

      // Deduplicate
      const uniquePapers = deduplicatePapers(transformedPapers);

      setPapers(uniquePapers);
      setTotalResults(uniquePapers.length);

      if (uniquePapers.length === 0) {
        setError("No results found. Try different keywords.");
      }
    } catch (err) {
      console.error("[useSearch] Error:", err);
      setError(getErrorMessage(err));
      setPapers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "" && searchPerformed) {
      setPapers([]);
      setSearchPerformed(false);
      setError(null);
    }
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      author: "",
      yearFrom: "",
      yearTo: "",
      journal: "",
      keywords: "",
      citationMin: "",
      citationMax: "",
      openAccess: false,
    });
  };

  const hasActiveFilters = Object.entries(advancedFilters).some(
    ([key, value]) => {
      if (key === "openAccess") return value === true;
      return value !== "";
    }
  );

  return {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    sortBy,
    setSortBy,
    source,
    setSource,
    papers,
    setPapers,
    loading,
    error,
    setError,
    searchPerformed,
    setSearchPerformed,
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
  };
}