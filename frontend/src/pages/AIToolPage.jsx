import React, { useState } from "react";
import { Upload, FileText, Check, Zap, BookOpen } from "lucide-react";
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

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen overflow-hidden border-8 border-purple-200">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 p-6 ml-20">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 max-w-6xl">
            {/* Hero Section */}
            <section className="relative h-56 rounded-3xl overflow-hidden mb-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700" />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center">
                <h1 className="text-4xl font-bold text-white mb-2">
                  AI Research Tools
                </h1>
                <p className="text-purple-100 text-lg">
                  Upload your document to check plagiarism or get a smart
                  summary
                </p>
                <div className="flex gap-3 mt-4">
                  <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg">
                    <Zap size={18} /> Get Started
                  </button>
                  <button className="bg-white/90 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-white transition flex items-center gap-2 shadow-lg">
                    <BookOpen size={18} /> Learn More
                  </button>
                </div>
              </div>
            </section>

            {/* Tabs */}
            <div className="flex justify-center items-center gap-4 mb-10">
              <button
                onClick={() => {
                  setActiveTab("plagiarism");
                  setFile(null);
                }}
                className={`px-6 py-2.5 font-semibold transition flex items-center justify-center gap-2 w-[180px] h-10 rounded-full ${
                  activeTab === "plagiarism"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-900 hover:bg-purple-200"
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
                className={`px-6 py-2.5 font-semibold transition flex items-center justify-center gap-2 w-[180px] h-10 rounded-full ${
                  activeTab === "summarize"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                }`}
              >
                {activeTab === "summarize" && <Check size={18} />}
                Summarize
              </button>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                dragActive
                  ? "border-purple-500 bg-purple-50"
                  : "border-purple-200 bg-purple-100/30 hover:bg-purple-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-purple-500 mb-4" />
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {file
                  ? `File selected: ${file.name}`
                  : "Drag & drop your file here or click to upload"}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Supports PDF, DOCX, TXT — up to 10MB
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
                className="cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition shadow-md"
              >
                {file ? "Choose Another File" : "Browse Files"}
              </label>
            </div>

            {/* Action Button */}
            {file && (
              <div className="text-center mt-8">
                <button
                  onClick={handleUpload}
                  className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2 mx-auto shadow-md"
                >
                  <FileText size={18} />
                  {activeTab === "plagiarism"
                    ? "Check for Plagiarism"
                    : "Generate Summary"}
                </button>
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
