import React, { useState } from "react";
import { Upload, FileText, Check, Sparkles, Shield, Clock } from "lucide-react";

import Sidebar from "../components/Sidebar";

export default function AIToolPage() {
  const [activeTab, setActiveTab] = useState("plagiarism");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = () => {
    if (!file) return alert("Please select a file first!");
    alert(`Uploading ${file.name} for ${activeTab}...`);
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Accurate Detection",
      description: "Advanced AI algorithms ensure precise plagiarism detection",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Results",
      description: "Get your analysis in seconds, not minutes",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Summaries",
      description: "AI-powered summaries that capture key insights",
    },
  ];

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6" style={{ marginLeft: "5vw" }}>
          <article className="bg-white rounded-t-3xl shadow-xl p-6 max-w-6xl">
            {/* Hero Section with floating elements */}
            <section className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600" />

              {/* Animated background circles */}
              <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute bottom-10 left-20 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                <div className="inline-block mb-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                  ✨ Powered by Advanced AI
                </div>
                <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                  AI Research Tools
                </h1>
                <p className="text-purple-100 text-lg max-w-2xl">
                  Upload your document to check plagiarism or get a smart
                  summary powered by cutting-edge AI technology
                </p>
              </div>
            </section>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Tabs with gradient background */}
              <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-8 py-6">
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveTab("plagiarism");
                      setFile(null);
                    }}
                    className={`px-8 py-3 font-semibold transition-all flex items-center justify-center gap-2 rounded-2xl ${
                      activeTab === "plagiarism"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                        : "bg-white text-purple-700 hover:bg-purple-50 shadow-md"
                    }`}
                  >
                    {activeTab === "plagiarism" && <Check size={18} />}
                    Plagiarism Check
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("summarize");
                      setFile(null);
                    }}
                    className={`px-8 py-3 font-semibold transition-all flex items-center justify-center gap-2 rounded-2xl ${
                      activeTab === "summarize"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                        : "bg-white text-purple-700 hover:bg-purple-50 shadow-md"
                    }`}
                  >
                    {activeTab === "summarize" && <Check size={18} />}
                    Summarize
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8">
                {/* Upload Area with enhanced design */}
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-[1.02]"
                      : "border-purple-300 bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-400 hover:shadow-lg"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-300 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-300 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-300 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-300 rounded-br-lg"></div>

                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Upload className="w-10 h-10 text-white" />
                  </div>

                  <p className="text-xl font-bold text-gray-800 mb-2">
                    {file ? `📄 ${file.name}` : "Drag & drop your file here"}
                  </p>
                  <p className="text-gray-500 mb-6">
                    or click below to browse • Supports PDF, DOCX, TXT • up to
                    10MB
                  </p>

                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="fileUpload"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    <FileText size={18} />
                    {file ? "Choose Another File" : "Browse Files"}
                  </label>
                </div>

                {/* Action Button */}
                {file && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleUpload}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-2xl hover:scale-105 text-lg"
                    >
                      <Sparkles size={20} />
                      {activeTab === "plagiarism"
                        ? "Check for Plagiarism"
                        : "Generate Summary"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
