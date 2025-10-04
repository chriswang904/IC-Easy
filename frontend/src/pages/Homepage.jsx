import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");

  const navigationItems = [
    { icon: Star, label: "Starred" },
    { icon: Clock, label: "Recent" },
    { icon: BookOpen, label: "Collections" },
  ];

  const papers = [
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

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 p-6 ml-20">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 max-w-6xl">
            {/* Search Bar */}
            <div className="mb-6 bg-purple-50 rounded-3xl p-1 flex items-center max-w-2xl">
              <button
                className="p-3 hover:bg-white/50 rounded-full"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <input
                type="search"
                placeholder="Search papers, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700"
                aria-label="Search"
              />
              <button
                className="p-3 hover:bg-white/50 rounded-full"
                aria-label="Voice search"
              >
                <Search className="w-6 h-6 text-gray-600" />
              </button>
            </div>

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

            {/* Papers List */}
            <section
              className="space-y-4 mt-8"
              role="tabpanel"
              aria-labelledby="notes-tab"
            >
              {papers.map((paper, index) => (
                <article
                  key={paper.id}
                  className="flex items-start gap-4 p-4 hover:bg-purple-50 rounded-2xl transition group cursor-pointer border border-transparent hover:border-purple-200"
                >
                  {/* Image Container - Remove padding, just keep as wrapper */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={paper.image}
                      alt={paper.title}
                      className="w-full h-full object-cover rounded-2xl"
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
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {paper.description}
                    </p>
                  </div>

                  {/* Action Icon */}
                  <button className="p-2 hover:bg-purple-100 rounded-full transition">
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
          </article>
        </div>
      </div>
    </main>
  );
}
