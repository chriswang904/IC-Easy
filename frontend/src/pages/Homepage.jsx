import React, { useState, useEffect } from "react";
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
import { searchLiterature, getErrorMessage } from "../api";

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

  useEffect(() => {
    if (searchPerformed) {
      handleSearch();
    }
  }, [sortBy, source]);
  
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

    try {
      console.log("[Homepage] Searching for:", searchQuery);
      console.log("[Homepage] Search params:", {
        keyword: searchQuery,
        limit: 10,
        source,
        sort_by: sortBy,
      });

      const result = await searchLiterature({
        keyword: searchQuery,
        limit: 10,
        source,
        sort_by: sortBy,
        filters: null,
      });

      console.log("[Homepage] Search results:", result);
      console.log("[Homepage] Number of results:", result.results?.length || 0);

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

        return {
          id: paper.doi || paper.url || `paper-${index}`,
          image: "/images/note1.jpg", // Default image
          title: paper.title || "Untitled",
          category: paper.journal || paper.source || "Research Paper",
          metadata: `${paper.citation_count || 0} citations • ${year}`,
          description: paper.abstract || "No abstract available.",
          color: `bg-${
            ["blue", "green", "purple", "pink", "yellow"][index % 5]
          }-50`,
          authors: authorNames,
          doi: paper.doi,
          url: paper.url,
        };
      });

      setPapers(transformedPapers);

      if (transformedPapers.length === 0) {
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

  const displayPapers = searchPerformed ? papers : defaultPapers;

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
                      <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition">
                        {paper.title}
                      </h2>
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
                    </div>
                    <button className="p-2 hover:bg-purple-100 rounded-full transition opacity-0 group-hover:opacity-100">
                      <Star className="w-5 h-5 text-gray-400" />
                    </button>
                  </article>
                ))}
              </section>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}