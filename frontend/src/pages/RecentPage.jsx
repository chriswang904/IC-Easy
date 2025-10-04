import React, { useState } from "react";
import { FileText, BookOpen, PenSquare } from "lucide-react";
import Sidebar from "../components/Sidebar";
import MenuSection from "../components/MenuSection";

function RecentPage() {
  const [activeTab, setActiveTab] = useState("all");

  const contentTabs = [
    { id: "all", label: "All" },
    { id: "notes", label: "Notes" },
    { id: "essays", label: "Essays" },
    { id: "papers", label: "Papers" },
  ];

  const recentItems = [
    {
      id: 1,
      title: "Attention Is All You Need",
      type: "papers",
      avatar: "A",
      date: "2 days ago",
      description:
        "Transformer architecture paper introducing self-attention mechanisms",
    },
    {
      id: 2,
      title: "Deep Learning Fundamentals",
      type: "notes",
      avatar: "D",
      date: "3 days ago",
      description: "Key concepts in neural networks and backpropagation",
    },
    {
      id: 3,
      title: "The Future of AI Research",
      type: "essays",
      avatar: "F",
      date: "1 week ago",
      description: "Analysis of emerging trends in artificial intelligence",
    },
    {
      id: 4,
      title: "BERT: Pre-training Language Models",
      type: "papers",
      avatar: "B",
      date: "1 week ago",
      description: "Bidirectional encoder representations from transformers",
    },
    {
      id: 5,
      title: "Machine Learning Study Notes",
      type: "notes",
      avatar: "M",
      date: "2 weeks ago",
      description: "Supervised and unsupervised learning techniques",
    },
    {
      id: 6,
      title: "Ethics in AI Development",
      type: "essays",
      avatar: "E",
      date: "2 weeks ago",
      description: "Exploring ethical considerations in modern AI systems",
    },
  ];

  const filteredItems =
    activeTab === "all"
      ? recentItems
      : recentItems.filter((item) => item.type === activeTab);

  const getTypeIcon = (type) => {
    switch (type) {
      case "notes":
        return <FileText size={16} />;
      case "essays":
        return <PenSquare size={16} />;
      case "papers":
        return <BookOpen size={16} />;
      default:
        return null;
    }
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
      <div className="flex min-h-screen bg-[#fef7ff]">
        {/* Shared Sidebar */}
        <Sidebar />
        {/* Menu Section */}
        <MenuSection />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto">
              {/* Center the tab navigation */}
              <div className="flex justify-center">
                {/* Horizontal Tab Navigation */}
                <nav
                  className="flex items-center gap-2 bg-[#f3edf7] rounded-full p-2 w-fit"
                  role="tablist"
                >
                  {contentTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      className={`px-6 py-2 rounded-full font-medium transition ${
                        activeTab === tab.id
                          ? "bg-[#e8def8] text-[#1d1b20] font-semibold"
                          : "text-[#49454f] hover:bg-white/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </header>

          {/* Items List */}
          <main className="flex-1 px-8 py-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <ul className="space-y-3" role="list">
                {filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-purple-50 transition cursor-pointer border border-gray-200 hover:border-purple-200"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-[#eaddff] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#4f378a] font-medium text-base">
                        {item.avatar}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full flex-shrink-0">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-medium capitalize">
                        {item.type}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No {activeTab === "all" ? "items" : activeTab} found
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}

export default RecentPage;
