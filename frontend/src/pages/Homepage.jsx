import React, { useState, useEffect, useRef  } from "react";
import {
  Search,
  Star,
  Clock,
  BookOpen,
  Loader,
  AlertCircle,
  SlidersHorizontal,
  X,
  Zap,
  FileText,
} from "lucide-react";
import { searchLiterature, getErrorMessage, getLatest  } from "../api";

import { getTopicImages } from "../services/image_service";

import Sidebar from "../components/Sidebar";
export default function Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [source, setSource] = useState("all");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Add different pages
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 
  const [totalResults, setTotalResults] = useState(0);

  const [selectedTopic, setSelectedTopic] = useState("ai");
  const [topicMode, setTopicMode] = useState("latest");
  const [topicPapers, setTopicPapers] = useState([]);
  const [loadingTopic, setLoadingTopic] = useState(false);

  const [topicImages, setTopicImages] = useState({});

  const debounceTimer = useRef(null);


  useEffect(() => {
    if (searchPerformed) {
      setCurrentPage(1);
      handleSearch();
    }
  }, [sortBy, source]);

  // ---------- new effect for topic papers ----------
  useEffect(() => {
    if (Object.keys(topicImages).length > 0) {
      loadTopicPapers(selectedTopic, topicMode);
    }
  }, [selectedTopic, topicMode, topicImages]);

  useEffect(() => {
    if (Object.keys(topicImages).length > 0) {

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      debounceTimer.current = setTimeout(() => {
        loadTopicPapers(selectedTopic, topicMode);
      }, 300);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [selectedTopic, topicMode, topicImages]);

  // ---------- load topic papers ----------
  const loadTopicPapers = async (topicKey, mode) => {
    setLoadingTopic(true);
    try {
      let results = [];

      const { results: papers } = await getLatest({
        source: "openalex",
        topicKey,
        limit: 15,
        mode: mode,  
      });
      
      results = papers || [];

      const topicItem = topics.find((t) => t.id === topicKey);
      const topicImagesList = topicImages[topicKey] || [
        topicItem?.image || "/images/note1.jpg",
      ];

      const transformed = (results || []).map((paper, i) => ({
        id: paper.doi || paper.url || `topic-${topicKey}-${i}`,
        title: paper.title || "Untitled",
        description: paper.abstract || "No abstract available.",
        image: topicImagesList[i % topicImagesList.length],
        metadata:
          mode === "latest"
            ? `${paper.published_date?.slice(0, 10) || "N/A"} • Latest`
            : `${paper.citation_count ?? 0} citations • ${
                paper.published_date?.slice(0, 4) || "N/A"
              }`,
        url: paper.url,
        source: paper.source,
        authors: paper.authors?.map((a) => a.name).filter(Boolean) || [],
        citationCount: paper.citation_count,
      }));

      setTopicPapers(transformed);
    } catch (err) {
      console.error(err);
      setTopicPapers([]);
    } finally {
      setLoadingTopic(false);
    }
  };

  
  useEffect(() => {
    async function preloadImages() {
      console.log("preloadImages started");
      const loaded = {};
      for (const topic of topics) {
        console.log(`[Unsplash] Fetching images for: ${topic.name}`);
        const remote = await getTopicImages(topic.name, 5);
        console.log(`[Unsplash] ${topic.name} →`, remote);
        if (remote.length > 0) {
          loaded[topic.id] = remote;
        } else {
          // fallback to local files
          loaded[topic.id] = [
            `${topic.image}`,
            `/images/topics/${topic.id}/1.jpg`,
            `/images/topics/${topic.id}/2.jpg`,
            `/images/topics/${topic.id}/3.jpg`,
          ];
        }
      }
      console.log("Loaded topic images:", loaded);
      setTopicImages(loaded);
    }
    preloadImages();
  }, []);


  // Advanced search state
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


  const topics = [
    { id: "ai",         name: "Artificial Intelligence", image: "/images/topics/ai.jpg",         color: "from-purple-500 to-indigo-500" },
    { id: "economics",  name: "Economics",               image: "/images/topics/economics.jpg",  color: "from-yellow-400 to-amber-500" },
    { id: "biology",    name: "Biology",                 image: "/images/topics/biology.jpg",    color: "from-green-500 to-lime-400" },
    { id: "physics",    name: "Physics",                 image: "/images/topics/physics.jpg",    color: "from-blue-600 to-indigo-600" },
    { id: "environment",name: "Environment",             image: "/images/topics/environment.jpg",color: "from-emerald-500 to-green-400" },
    { id: "medicine",   name: "Medicine",                image: "/images/topics/medicine.jpg",   color: "from-rose-500 to-pink-400" },
  ];


  const defaultPapers = [
    {
      id: "1",
      image: "/images/note1.jpg",
      title: "Attention Is All You Need",
      category: "Machine Learning",
      metadata: "45,231 citations • Added 2 days ago",
      description:
        "Transformer architecture paper introducing self-attention mechanisms. Key findings on sequence-to-sequence models and applications in NLP tasks.",
      color: "bg-blue-50",
    },
    {
      id: "2",
      image: "/images/note2.jpg",
      title: "Climate Change Impact on Ecosystems",
      category: "Environmental Science",
      metadata: "Open Access • Added 1 week ago",
      description:
        "Comprehensive study analyzing biodiversity loss patterns and ecosystem adaptation strategies under various climate scenarios through 2050.",
      color: "bg-green-50",
    },
    {
      id: "3",
      image: "/images/note3.jpg",
      title: "CRISPR Gene Editing Applications",
      category: "Biotechnology",
      metadata: "Peer-reviewed • Added 3 weeks ago",
      description:
        "Latest developments in gene therapy techniques, focusing on disease treatment protocols and ethical considerations in clinical applications.",
      color: "bg-purple-50",
    },
  ];

  /**
   * Handle search submission
   */
  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    // Add to search history (keep last 10)
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
    setCurrentPage(1);

    // === Determine topic category for images ===
    const keyword = searchQuery.toLowerCase();
    let topicKey = "ai"; 

    if (keyword.includes("bio")) topicKey = "biology";
    else if (keyword.includes("med")) topicKey = "medicine";
    else if (keyword.includes("eco")) topicKey = "economics";
    else if (keyword.includes("phys")) topicKey = "physics";
    else if (keyword.includes("env")) topicKey = "environment";
    else if (keyword.includes("climate") || keyword.includes("green")) topicKey = "environment";
    else if (keyword.includes("health")) topicKey = "medicine";

    let topicImagesList =
      topicImages[topicKey] && topicImages[topicKey].length > 0
        ? topicImages[topicKey]
        : [];

    if (topicImagesList.length === 0 && topicImages["ai"]?.length > 0) {
      topicImagesList = topicImages["ai"];
    }

    if (topicImagesList.length === 0) {
      topicImagesList = [
        "/images/note1.jpg",
        "/images/note2.jpg",
        "/images/note3.jpg",
      ];
    }

    console.log("[Search] Using topicKey:", topicKey);
    console.log("[Search] Using topicImagesList:", topicImagesList);


    try {
      console.log("[Homepage] Searching for:", searchQuery);

      const filters = {};

      if (advancedFilters.author) filters.author = advancedFilters.author;
      if (advancedFilters.yearFrom)
        filters.year_from = parseInt(advancedFilters.yearFrom);
      if (advancedFilters.yearTo)
        filters.year_to = parseInt(advancedFilters.yearTo);
      if (advancedFilters.journal) filters.journal = advancedFilters.journal;
      if (advancedFilters.keywords) {
        filters.keywords = advancedFilters.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
      }
      if (advancedFilters.citationMin)
        filters.citation_min = parseInt(advancedFilters.citationMin);
      if (advancedFilters.citationMax)
        filters.citation_max = parseInt(advancedFilters.citationMax);
      if (advancedFilters.openAccess) filters.open_access = true;

      console.log("[Homepage] Search params:", {
        keyword: searchQuery,
        limit: 10,
        source,
        sort_by: sortBy,
        filters: Object.keys(filters).length > 0 ? filters : null,
      });

      const result = await searchLiterature({
        keyword: searchQuery,
        limit: 50,
        source,
        sort_by: sortBy,
        filters: Object.keys(filters).length > 0 ? filters : null,
      });

      console.log("[Homepage] Search results:", result);
      console.log("[Homepage] Number of results:", result.results?.length || 0);

      console.log("[Homepage] Raw API response:", result);
      console.log("[Homepage] Number of results:", result.results?.length || 0);
      
      if (result.results) {
        console.log("[Homepage] Paper titles:");
        result.results.forEach((paper, index) => {
          console.log(`  [${index}] ${paper.title}`);
        });
      }

      // Log first result structure if available
      if (result.results && result.results.length > 0) {
        console.log("[Homepage] First result structure:", result.results[0]);
      }

      // Transform API results to match component format
      const transformedPapers = (result.results || []).map((paper, index) => {
        // Extract year from published_date
        let year = "N/A";
        if (paper.published_date) {
          const match = paper.published_date.match(/^(\d{4})/);
          year = match ? match[1] : "N/A";
        }

        // Get author names from authors array
        const authorNames = paper.authors
          ? paper.authors.map((a) => a.name || a).filter(Boolean)
          : [];

        let citationText = "";
        if (paper.source === "arxiv") {
          citationText = "Preprint (no citation data)";
        } else if (
          paper.citation_count !== null &&
          paper.citation_count !== undefined
        ) {
          citationText = `${paper.citation_count} citations`;
        } else {
          citationText = "Citation data unavailable";
        }

        return {
          id: paper.doi || paper.url || `paper-${index}`,
          // image: "/images/note1.jpg", // Default image
          image: topicImagesList[index % topicImagesList.length],
          title: paper.title || "Untitled",
          category: paper.journal || paper.source || "Research Paper",
          metadata: `${citationText} • ${year}`,
          description: paper.abstract || "No abstract available.",
          color: `bg-${
            ["blue", "green", "purple", "pink", "yellow"][index % 5]
          }-50`,
          authors: authorNames,
          doi: paper.doi,
          url: paper.url,
          source: paper.source,
          citationCount: paper.citation_count,
        };
      });


      console.log("[Homepage] Transformed papers count:", transformedPapers.length);
      console.log("[Homepage] Transformed paper titles:");
      transformedPapers.forEach((paper, index) => {
        console.log(`  [${index}] ${paper.title.substring(0, 60)}...`);
      });


      const uniquePapers = [];
      const seenDOIs = new Set();
      const seenTitles = new Set();

      for (const paper of transformedPapers) {

        if (paper.doi) {
          if (seenDOIs.has(paper.doi)) {
            console.log(`[Homepage] Skipping duplicate DOI: ${paper.doi}`);
            continue;
          }
          seenDOIs.add(paper.doi);
        }

        const normalizedTitle = paper.title.toLowerCase().trim().replace(/[^\w\s]/g, '');
        if (seenTitles.has(normalizedTitle)) {
          console.log(`[Homepage] Skipping duplicate title: "${paper.title.substring(0, 50)}..."`);
          continue;
        }
        seenTitles.add(normalizedTitle);
        
        uniquePapers.push(paper);
      }

      console.log(`[Homepage] After deduplication: ${transformedPapers.length} → ${uniquePapers.length} unique papers`);

      const uniqueTitles = new Set(uniquePapers.map(p => p.title));
      console.log("[Homepage] Unique titles count:", uniqueTitles.size);

      setPapers(uniquePapers); 
      setTotalResults(uniquePapers.length);

      if (uniquePapers.length === 0) {
        setError("No results found. Try different keywords.");
      }
    } catch (err) {
      console.error("[Homepage] Search error:", err);
      let errorMessage = "An error occurred while searching";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setPapers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search input change with debounce
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Reset to default papers when search is cleared
    if (e.target.value === "" && searchPerformed) {
      setPapers([]);
      setSearchPerformed(false);
      setError(null);
    }
  };

  /**
   * Handle paper click
   */
  const handlePaperClick = (paper) => {
    console.log("[Homepage] Paper clicked:", paper);
    // Navigate to paper detail page or open URL
    if (paper.url) {
      window.open(paper.url, "_blank");
    }
  };

  /**
   * Handle clicking on a search history item
   */
  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
    // Trigger search with the selected query
    setTimeout(() => {
      document.querySelector('button[type="submit"]').click();
    }, 0);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = papers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(papers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayPapers = searchPerformed
  ? currentItems
  : topicPapers.length > 0
    ? topicPapers
    : defaultPapers;

  const handleTopicClick = async (topicKey) => {
    const topic = topics.find(t => t.id === topicKey);

    setSearchQuery(topic?.name || topicKey);
    setLoading(true);
    setSearchPerformed(true);
    setError(null);
    setShowSearchHistory(false);
    setCurrentPage(1);

    try {
      let results = [];

      if (topicMode === 'latest') {
        const { results: latest } = await getLatest({ source: "arxiv", topicKey, limit: 3 });
        results = latest;
        if (!results || results.length === 0) {
          const fallback = await getLatest({ source: "openalex", topicKey, limit: 3 });
          results = fallback.results || [];
        }
      } else {

        const hot = await searchLiterature({
          keyword: topic?.name || topicKey,
          limit: 3,
          source: "all",
          sort_by: "citations",
          filters: null,
        });
        results = hot.results || [];
      }

      const topicImagesList = topicImages[topicKey] || [topic.image];

      const transformed = (results || []).slice(0, 5).map((paper, i) => ({
        id: paper.doi || paper.url || `topic-${topicKey}-${i}`,
        title: paper.title || "Untitled",
        description: paper.abstract || "No abstract available.",
        metadata:
          topicMode === 'latest'
            ? `${paper.published_date?.slice(0,10) || "N/A"} • Latest`
            : `${paper.citation_count ?? 0} citations • ${paper.published_date?.slice(0,4) || "N/A"}`,
        url: paper.url,
        image: topicImagesList[i % topicImagesList.length],
        category: topic?.name || topicKey,
        source: paper.source,
        authors: paper.authors?.map(a => a.name).filter(Boolean) || [],
        citationCount: paper.citation_count,
        doi: paper.doi,
      }));

      setPapers(transformed);
    } catch (err) {
      setError(getErrorMessage?.(err) || "Failed to load topic papers.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex justify-center items-start p-6">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 w-[90%] max-w-6xl min-h-screen">
            {/* Search Bar */}
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl z-10">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Recent Searches
                      </h3>
                      <button
                        onClick={() => {
                          setSearchHistory([]);
                          setShowSearchHistory(false);
                        }}
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
                          onClick={() => handleHistoryClick(query)}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 transition"
                        >
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 flex-1">{query}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advanced Search Panel */}
              {showAdvancedSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl z-10">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Advanced Search
                      </h3>
                      <button
                        onClick={() => setShowAdvancedSearch(false)}
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
                        onClick={resetAdvancedFilters}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={handleSearch}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {searchPerformed && (
              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sort by:
                  </label>
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
                  <label className="text-sm font-medium text-gray-700">
                    Source:
                  </label>
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
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Search Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!searchPerformed && (
              <section className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700" />
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>
                <div className="relative h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Discover Your Next Academic Journey
                  </h1>
                  <p className="text-purple-100 mb-6">
                    AI-powered research assistant for smarter paper discovery
                    and writing
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg">
                      <Zap size={18} />
                      Get Started
                    </button>
                    <button className="bg-white/90 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-white transition flex items-center gap-2 shadow-lg">
                      <BookOpen size={18} />
                      Browse 10M+ Papers
                    </button>
                  </div>
                </div>
              </section>
            )}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Searching for papers...</p>
                </div>
              </div>
            )}

            {/* === Topic Selector (controls only, not list) === */}
            {!searchPerformed && (
              <div className="flex flex-wrap items-center gap-4 mt-6 mb-4">
                <select
                  className="border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-purple-500"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded-full border ${
                      topicMode === "latest"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                    onClick={() => setTopicMode("latest")}
                  >
                    Latest
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full border ${
                      topicMode === "citations"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                    onClick={() => setTopicMode("citations")}
                  >
                    Most Cited
                  </button>
                </div>
              </div>
            )}


            {!loading && (
              <section className="space-y-4 mt-8">
                {displayPapers.length === 0 && !error && searchPerformed && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No papers found. Try a different search.
                    </p>
                  </div>
                )}

                {displayPapers.map((paper) => (
                  <article
                    key={paper.id}
                    onClick={() => handlePaperClick(paper)}
                    className="flex items-start gap-4 p-4 hover:bg-purple-50 rounded-2xl transition group cursor-pointer border border-transparent hover:border-purple-200"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={paper.image}
                        alt={paper.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition flex-1">
                          {paper.title}
                        </h2>
                        {paper.source && (
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                              paper.source === "arxiv"
                                ? "bg-orange-100 text-orange-700"
                                : paper.source === "crossref"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {paper.source === "arxiv"
                              ? "arXiv"
                              : paper.source === "crossref"
                              ? "CrossRef"
                              : "OpenAlex"}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium text-purple-600">
                          {paper.category}
                        </span>{" "}
                        • {paper.metadata}
                      </p>

                      {paper.authors && paper.authors.length > 0 && (
                        <p className="text-xs text-gray-500 mb-1">
                          {paper.authors.slice(0, 3).join(", ")}
                          {paper.authors.length > 3 &&
                            ` +${paper.authors.length - 3} more`}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {paper.description}
                      </p>

                      {paper.source === "arxiv" && (
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="italic">
                            Preprint - citation data not available
                          </span>
                        </p>
                      )}
                    </div>

                    <button className="p-2 hover:bg-purple-100 rounded-full transition opacity-0 group-hover:opacity-100">
                      <Star className="w-5 h-5 text-gray-400" />
                    </button>
                  </article>
                ))}
              </section>
            )}
            {searchPerformed && papers.length > 0 && (
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                {/* result info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, papers.length)}
                  </span>{" "}
                  of <span className="font-medium">{papers.length}</span> results
                </div>

                {/* page button */}
                <div className="flex items-center gap-2">
                  {/* upper page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {/* index */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                        return false;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && page - array[index - 1] > 1 && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  {/* next page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )} 
          </article>
        </div>
      </div>
    </main>
  );
}