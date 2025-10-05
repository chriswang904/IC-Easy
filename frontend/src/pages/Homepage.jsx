// import React, { useState } from "react";
// import {
//   Menu,
//   Search,
//   FileText,
//   Star,
//   Clock,
//   BookOpen,
//   Mic,
//   MoreVertical,
//   Check,
//   Zap,
//   Edit,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";

// export default function Homepage() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("notes");
//   const [searchQuery, setSearchQuery] = useState("");

//   const navigationItems = [
//     { icon: Star, label: "Starred" },
//     { icon: Clock, label: "Recent" },
//     { icon: BookOpen, label: "Collections" },
//   ];

//   const papers = [
//     {
//       id: "1",
//       image: "/images/note1.jpg",
//       title: "Attention Is All You Need",
//       category: "Machine Learning",
//       metadata: "45,231 citations • Added 2 days ago",
//       progress: 65,
//       description:
//         "Transformer architecture paper introducing self-attention mechanisms. Key findings on sequence-to-sequence models and applications in NLP tasks.",
//       color: "bg-blue-50",
//     },
//     {
//       id: "2",
//       image: "/images/note2.jpg",
//       title: "Climate Change Impact on Ecosystems",
//       category: "Environmental Science",
//       metadata: "Open Access • Added 1 week ago",
//       progress: 20,
//       description:
//         "Comprehensive study analyzing biodiversity loss patterns and ecosystem adaptation strategies under various climate scenarios through 2050.",
//       color: "bg-green-50",
//     },
//     {
//       id: "3",
//       image: "/images/note3.jpg",
//       title: "CRISPR Gene Editing Applications",
//       progress: 5,
//       category: "Biotechnology",
//       metadata: "Peer-reviewed • Added 3 weeks ago",
//       description:
//         "Latest developments in gene therapy techniques, focusing on disease treatment protocols and ethical considerations in clinical applications.",
//       color: "bg-purple-50",
//     },
//   ];

//   return (
//     <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
//       <div className="flex">
//         {/* Left Sidebar */}
//         <Sidebar />
//         {/* Main Content */}
//         <div className="flex-1 p-6 ml-20">
//           <article className="bg-white rounded-t-3xl shadow-xl p-6 max-w-6xl">
//             {/* Search Bar */}
//             <div className="mb-6 bg-purple-50 rounded-3xl p-1 flex items-center max-w-2xl">
//               <button
//                 className="p-3 hover:bg-white/50 rounded-full"
//                 aria-label="Menu"
//               >
//                 <Menu className="w-6 h-6 text-gray-600" />
//               </button>
//               <input
//                 type="search"
//                 placeholder="Search papers, topics, or authors..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700"
//                 aria-label="Search"
//               />
//               <button
//                 className="p-3 hover:bg-white/50 rounded-full"
//                 aria-label="Voice search"
//               >
//                 <Search className="w-6 h-6 text-gray-600" />
//               </button>
//             </div>

//             {/* Hero Section */}
//             <section className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
//               {/* Background gradient */}
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700" />

//               {/* Background image */}
//               <div className="absolute inset-0 bg-black/20">
//                 <img
//                   src="images/mainPage.jpg"
//                   alt="Research background"
//                   className="w-full h-full object-cover mix-blend-overlay"
//                 />
//               </div>

//               {/* Content */}
//               <div className="relative h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
//                 <h1 className="text-4xl font-bold text-white mb-2">
//                   Discover Your Next Academic Journey
//                 </h1>
//                 <p className="text-purple-100 mb-6">
//                   AI-powered research assistant for smarter paper discovery and
//                   writing
//                 </p>

//                 <div className="flex gap-3">
//                   <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg">
//                     <Zap size={18} />
//                     Get Started
//                   </button>
//                   <button className="bg-white/90 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-white transition flex items-center gap-2 shadow-lg">
//                     <BookOpen size={18} />
//                     Browse 10M+ Papers
//                   </button>
//                 </div>
//               </div>
//             </section>

//             {/* Tabs */}
//             <div className="flex justify-center items-center gap-4">
//               <button
//                 onClick={() => setActiveTab("notes")}
//                 className={`px-6 py-2.5 font-semibold transition flex items-center justify-center gap-2 w-[125.5px] h-10 rounded-full ${
//                   activeTab === "notes"
//                     ? "bg-purple-600 text-white"
//                     : "bg-purple-100 text-purple-900 hover:bg-purple-200"
//                 }`}
//                 role="tab"
//                 aria-selected={activeTab === "notes"}
//               >
//                 {activeTab === "notes" && <Check size={18} />}
//                 Notes
//               </button>
//               <button
//                 onClick={() => setActiveTab("essay")}
//                 className={`px-6 py-2.5 font-semibold transition flex items-center justify-center w-[125.5px] h-10 rounded-full ${
//                   activeTab === "essay"
//                     ? "bg-purple-600 text-white"
//                     : "bg-purple-100 text-purple-900 hover:bg-purple-200"
//                 }`}
//                 role="tab"
//                 aria-selected={activeTab === "essay"}
//               >
//                 {activeTab === "essay" && <Check size={18} />}
//                 Essay
//               </button>
//             </div>

//             {/* Papers List */}
//             <section
//               className="space-y-4 mt-8"
//               role="tabpanel"
//               aria-labelledby="notes-tab"
//             >
//               {papers.map((paper, index) => (
//                 <article
//                   key={paper.id}
//                   className="flex items-start gap-4 p-4 hover:bg-purple-50 rounded-2xl transition group cursor-pointer border border-transparent hover:border-purple-200"
//                 >
//                   {/* Image Container - Remove padding, just keep as wrapper */}
//                   <div className="w-20 h-20 flex-shrink-0">
//                     <img
//                       src={paper.image}
//                       alt={paper.title}
//                       className="w-full h-full object-cover rounded-2xl"
//                     />
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 min-w-0">
//                     <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition">
//                       {paper.title}
//                     </h2>
//                     <p className="text-sm text-gray-600 mb-2">
//                       <span className="font-medium text-purple-600">
//                         {paper.category}
//                       </span>{" "}
//                       • {paper.metadata}
//                     </p>
//                     <p className="text-sm text-gray-600 line-clamp-1">
//                       {paper.description}
//                     </p>
//                   </div>

//                   {/* Action Icon */}
//                   <button className="p-2 hover:bg-purple-100 rounded-full transition">
//                     <svg className="w-7 h-7 transform -rotate-90">
//                       <circle
//                         cx="14"
//                         cy="14"
//                         r="12"
//                         stroke="#E9D5FF"
//                         strokeWidth="2"
//                         fill="none"
//                       />
//                       <circle
//                         cx="14"
//                         cy="14"
//                         r="12"
//                         stroke="#9333EA"
//                         strokeWidth="2"
//                         fill="none"
//                         strokeDasharray="75.4"
//                         strokeDashoffset={75.4 - (75.4 * paper.progress) / 100}
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                   </button>
//                 </article>
//               ))}
//             </section>
//           </article>
//         </div>
//       </div>
//     </main>
//   );
// }
/**
 * Homepage Component - Updated with API Integration
 * 
 * This component displays the main page with paper search functionality
 * connected to the backend API.
 * 
 * @component
 */

import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  FileText,
  Star,
  Clock,
  BookOpen,
  Mic,
  MoreVertical,
  Check,
  Zap,
  Edit,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { searchLiterature, getErrorMessage } from "../api";

export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  
  // API state management
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const navigationItems = [
    { icon: Star, label: "Starred" },
    { icon: Clock, label: "Recent" },
    { icon: BookOpen, label: "Collections" },
  ];

  /**
   * Default papers to display before search
   */
  const defaultPapers = [
    {
      id: "1",
      image: "/images/note1.jpg",
      title: "Attention Is All You Need",
      category: "Machine Learning",
      metadata: "45,231 citations • Added 2 days ago",
      progress: 65,
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
      progress: 20,
      description:
        "Comprehensive study analyzing biodiversity loss patterns and ecosystem adaptation strategies under various climate scenarios through 2050.",
      color: "bg-green-50",
    },
    {
      id: "3",
      image: "/images/note3.jpg",
      title: "CRISPR Gene Editing Applications",
      progress: 5,
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

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      console.log('[Homepage] Searching for:', searchQuery);
      
      const result = await searchLiterature({
        keyword: searchQuery,
        limit: 10,
        source: 'crossref', // You can make this selectable
      });

      console.log('[Homepage] Search results:', result);

      // Transform API results to match component format
      const transformedPapers = (result.results || []).map((paper, index) => ({
        id: paper.doi || paper.id || `paper-${index}`,
        image: "/images/note1.jpg", // Default image
        title: paper.title || 'Untitled',
        category: paper.type || 'Research Paper',
        metadata: `${paper.citation_count || 0} citations • ${paper.year || 'N/A'}`,
        progress: 0,
        description: paper.abstract || 'No abstract available.',
        color: `bg-${['blue', 'green', 'purple', 'pink', 'yellow'][index % 5]}-50`,
        authors: paper.authors || [],
        doi: paper.doi,
        url: paper.url,
      }));

      setPapers(transformedPapers);

      if (transformedPapers.length === 0) {
        setError('No results found. Try different keywords.');
      }

    } catch (err) {
      console.error('[Homepage] Search error:', err);
      let errorMessage = 'An error occurred while searching';
    
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
    if (e.target.value === '' && searchPerformed) {
      setPapers([]);
      setSearchPerformed(false);
      setError(null);
    }
  };

  /**
   * Handle paper click
   */
  const handlePaperClick = (paper) => {
    console.log('[Homepage] Paper clicked:', paper);
    // Navigate to paper detail page or open URL
    if (paper.url) {
      window.open(paper.url, '_blank');
    }
  };

  /**
   * Get papers to display
   */
  const displayPapers = searchPerformed ? papers : defaultPapers;

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 p-6 ml-20">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 max-w-6xl">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6 bg-purple-50 rounded-3xl p-1 flex items-center max-w-2xl">
              <button
                type="button"
                className="p-3 hover:bg-white/50 rounded-full"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <input
                type="search"
                placeholder="Search papers, topics, or authors..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700"
                aria-label="Search"
                disabled={loading}
              />
              <button
                type="submit"
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
            </form>

            {/* Error Message */}
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Search Error</p>
                  <p className="text-red-600 text-sm">
                    {typeof error === 'string' ? error : error.message || 'An error occurred'}
                  </p>
                </div>
              </div>
            )}

            {/* Hero Section */}
            <section className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700" />

              {/* Background image */}
              <div className="absolute inset-0 bg-black/20">
                <img
                  src="images/mainPage.jpg"
                  alt="Research background"
                  className="w-full h-full object-cover mix-blend-overlay"
                />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Discover Your Next Academic Journey
                </h1>
                <p className="text-purple-100 mb-6">
                  AI-powered research assistant for smarter paper discovery and
                  writing
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => document.querySelector('input[type="search"]').focus()}
                    className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
                  >
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

            {/* Tabs */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-6 py-2.5 font-semibold transition flex items-center justify-center gap-2 w-[125.5px] h-10 rounded-full ${
                  activeTab === "notes"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                }`}
                role="tab"
                aria-selected={activeTab === "notes"}
              >
                {activeTab === "notes" && <Check size={18} />}
                Notes
              </button>
              <button
                onClick={() => setActiveTab("essay")}
                className={`px-6 py-2.5 font-semibold transition flex items-center justify-center w-[125.5px] h-10 rounded-full ${
                  activeTab === "essay"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                }`}
                role="tab"
                aria-selected={activeTab === "essay"}
              >
                {activeTab === "essay" && <Check size={18} />}
                Essay
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Searching for papers...</p>
                </div>
              </div>
            )}

            {/* Papers List */}
            {!loading && (
              <section
                className="space-y-4 mt-8"
                role="tabpanel"
                aria-labelledby="notes-tab"
              >
                {displayPapers.length === 0 && !error && searchPerformed && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No papers found. Try a different search.</p>
                  </div>
                )}

                {displayPapers.map((paper, index) => (
                  <article
                    key={paper.id}
                    onClick={() => handlePaperClick(paper)}
                    className="flex items-start gap-4 p-4 hover:bg-purple-50 rounded-2xl transition group cursor-pointer border border-transparent hover:border-purple-200"
                  >
                    {/* Image Container */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={paper.image}
                        alt={paper.title}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          e.target.src = '/images/note1.jpg'; // Fallback image
                        }}
                      />
                    </div>

                    {/* Content */}
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
                          {paper.authors.slice(0, 3).join(', ')}
                          {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {paper.description}
                      </p>
                    </div>

                    {/* Action Icon */}
                    <button 
                      className="p-2 hover:bg-purple-100 rounded-full transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites or other action
                      }}
                    >
                      <svg className="w-7 h-7 transform -rotate-90">
                        <circle
                          cx="14"
                          cy="14"
                          r="12"
                          stroke="#E9D5FF"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="14"
                          cy="14"
                          r="12"
                          stroke="#9333EA"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="75.4"
                          strokeDashoffset={75.4 - (75.4 * paper.progress) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
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