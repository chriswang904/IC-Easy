// pages/AIToolPage.jsx

import React, { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Shield,
  Clock,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { checkAIOnly } from "../api";

export default function AIToolPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("plagiarism");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
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
    if (dropped) {
      setFile(dropped);
      setError(null);
    }
  };

  const extractTextFromFile = async (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    try {
      // Handle TXT files
      if (fileExtension === ".txt" || file.type === "text/plain") {
        const text = await file.text();
        if (!text || text.trim().length === 0) {
          throw new Error("The text file appears to be empty.");
        }
        return text;
      }

      // Handle DOCX files
      if (
        fileExtension === ".docx" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (!result.value || result.value.trim().length === 0) {
          throw new Error(
            "Could not extract text from DOCX file or file is empty."
          );
        }
        return result.value;
      }

      // Handle PDF files
      if (fileExtension === ".pdf" || file.type === "application/pdf") {
        throw new Error(
          "PDF text extraction is not yet supported. Please convert to TXT or DOCX format."
        );
      }

      // Handle DOC files (old Word format)
      if (fileExtension === ".doc") {
        throw new Error(
          "Old .doc format is not supported. Please save as .docx or .txt format."
        );
      }

      throw new Error(
        `Unsupported file type: ${fileExtension}. Please use TXT or DOCX files.`
      );
    } catch (error) {
      console.error("File extraction error:", error);
      throw error;
    }
  };

  const summarizeWithSimpleAlgorithm = (text) => {
    // Simple extractive summarization algorithm
    // Split into sentences
    const sentences = text
      .replace(/\n+/g, " ")
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    if (sentences.length === 0) {
      throw new Error("No valid sentences found in the text.");
    }

    // Score sentences based on various factors
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;

      // Position score (first and last sentences are often important)
      if (index === 0) score += 3;
      if (index === sentences.length - 1) score += 2;
      if (index < sentences.length * 0.2) score += 1;

      // Length score (prefer medium-length sentences)
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount >= 10 && wordCount <= 30) score += 2;

      // Keyword density (look for important words)
      const importantWords = [
        "important",
        "significant",
        "key",
        "main",
        "primary",
        "essential",
        "critical",
        "major",
        "conclude",
        "result",
        "found",
        "show",
        "demonstrate",
      ];
      importantWords.forEach((word) => {
        if (sentence.toLowerCase().includes(word)) score += 1;
      });

      return { sentence, score, index };
    });

    // Sort by score and take top sentences
    const summaryLength = Math.max(
      3,
      Math.min(10, Math.ceil(sentences.length * 0.3))
    );
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryLength)
      .sort((a, b) => a.index - b.index);

    // Create summary
    const summary = topSentences.map((s) => `• ${s.sentence}`).join(".\n\n");

    return {
      summary: `**Key Points Summary:**\n\n${summary}.`,
      method: "fallback",
    };
  };

  const summarizeWithChrome = async (text) => {
    // Detailed diagnostic check
    console.log("=== Chrome AI Diagnostics ===");
    console.log("'ai' in window:", "ai" in window);
    console.log("'Summarizer' in window:", "Summarizer" in window);
    console.log("'AILanguageModel' in window:", "AILanguageModel" in window);
    console.log("Browser:", navigator.userAgent);

    if (window.ai) {
      console.log("window.ai properties:", Object.keys(window.ai));
    }

    // Check for Summarizer API (correct way)
    if ("Summarizer" in window && window.Summarizer) {
      console.log("Attempting to use Summarizer API...");
      try {
        const canSummarize = await window.Summarizer.capabilities();
        console.log("Summarizer capabilities:", canSummarize);

        if (canSummarize && canSummarize.available !== "no") {
          const summarizer = await window.Summarizer.create({
            type: "key-points",
            format: "markdown",
            length: "medium",
          });

          if (canSummarize.available === "after-download") {
            console.log("Model downloading...");
            summarizer.addEventListener("downloadprogress", (e) => {
              console.log(`Download progress: ${e.loaded}/${e.total}`);
            });
          }

          const summary = await summarizer.summarize(text);
          summarizer.destroy();

          return { summary, method: "chrome-ai" };
        }
      } catch (err) {
        console.log("Summarizer API failed:", err.message);
      }
    }

    // Check for AI Language Model (Prompt API)
    if ("AILanguageModel" in window && window.AILanguageModel) {
      console.log("Attempting to use AILanguageModel (Prompt API)...");
      try {
        const capabilities = await window.AILanguageModel.capabilities();
        console.log("AILanguageModel capabilities:", capabilities);

        if (capabilities && capabilities.available !== "no") {
          const session = await window.AILanguageModel.create({
            systemPrompt:
              "You are a helpful assistant that summarizes text into key points. Provide a concise summary.",
          });

          const summary = await session.prompt(
            `Summarize this text into key points:\n\n${text.substring(0, 4000)}`
          );
          session.destroy();

          return { summary, method: "chrome-prompt" };
        }
      } catch (err) {
        console.log("AILanguageModel failed:", err.message);
      }
    }

    // Legacy check for window.ai (older API structure)
    if (window.ai?.languageModel) {
      console.log("Attempting to use window.ai.languageModel...");
      try {
        const capabilities = await window.ai.languageModel.capabilities();
        console.log("Language Model capabilities:", capabilities);

        if (capabilities.available === "readily") {
          const session = await window.ai.languageModel.create({
            systemPrompt:
              "You are a helpful assistant that summarizes text into key points. Provide a concise summary.",
          });

          const summary = await session.prompt(
            `Summarize this text into key points:\n\n${text.substring(0, 4000)}`
          );
          session.destroy();

          return { summary, method: "chrome-prompt" };
        }
      } catch (err) {
        console.log("window.ai.languageModel failed:", err.message);
      }
    }

    if (window.ai?.summarizer) {
      console.log("Attempting to use window.ai.summarizer...");
      try {
        const availability = await window.ai.summarizer.capabilities();
        console.log("Summarizer availability:", availability);

        if (
          availability.available === "readily" ||
          availability.available === "after-download"
        ) {
          const summarizer = await window.ai.summarizer.create({
            type: "key-points",
            format: "markdown",
            length: "medium",
          });

          const summary = await summarizer.summarize(text);
          summarizer.destroy();

          return { summary, method: "chrome-ai" };
        }
      } catch (err) {
        console.log("window.ai.summarizer failed:", err.message);
      }
    }

    // Fallback to simple algorithm
    console.log(
      "All Chrome AI methods unavailable - using client-side extractive summarization algorithm"
    );
    return summarizeWithSimpleAlgorithm(text);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[AITool] Processing file: ${file.name}`);

      if (activeTab === "plagiarism") {
        console.log(
          "[AITool] This may take 30-60 seconds for first-time model loading..."
        );
        const result = await checkAIOnly(file, true);

        console.log("[AITool] Check result:", result);

        navigate("/plagiarism-result", {
          state: {
            result: {
              plagiarism_probability: result.plagiarism_probability,
              plagiarism_percent: result.plagiarism_percent,
              unique_percent: result.unique_percent,
              plagiarism_risk: result.plagiarism_risk,
              plagiarism_method: result.plagiarism_method,

              ai_probability: result.ai_probability,
              is_ai_generated: result.is_ai_generated,
              ai_confidence: result.ai_confidence,
              ai_detection_method: result.ai_detection_method,

              overall_risk: result.overall_risk,
              sources_found: result.sources_found,
              top_sources: result.top_sources,
              report_url: result.report_url,
              recommendations: result.recommendations,

              details: result.details,
              timestamp: result.timestamp,
              filename: file.name,
            },
          },
        });
      } else if (activeTab === "summarize") {
        console.log("[AITool] Extracting text from file...");
        const text = await extractTextFromFile(file);

        console.log("[AITool] Generating summary...");
        const result = await summarizeWithChrome(text);

        // Navigate to a summary result page
        navigate("/summarize-result", {
          state: {
            summary: result.summary,
            filename: file.name,
            originalLength: text.length,
            timestamp: new Date().toISOString(),
            method: result.method,
          },
        });
      }
    } catch (err) {
      console.error("[AITool] Error:", err);
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError(
          "Analysis is taking longer than expected. The models are loading for the first time. Please try again - it will be faster next time!"
        );
      } else {
        const backendDetail = err.response?.data?.detail;
        if (Array.isArray(backendDetail)) {
          setError(backendDetail[0]?.msg || JSON.stringify(backendDetail));
        } else if (typeof backendDetail === "object") {
          setError(backendDetail?.msg || JSON.stringify(backendDetail));
        } else {
          setError(err.message || "An error occurred during processing");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "AI-Powered Detection",
      description: "Advanced Winston Model for accurate plagiarism detection",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Results",
      description: "Get your analysis in seconds, not minutes",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Content Detection",
      description: "Detects if text is generated by AI (ensemble model)",
    },
  ];

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex justify-center items-start p-6">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 w-[90%] max-w-6xl min-h-screen">
            {/* Hero Section */}
            <section className="relative h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl">
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/aiToolPage.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/30" />{" "}
                {/* subtle dark overlay */}
              </div>

              <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute bottom-10 left-20 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                <div className="inline-block mb-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                  ✨ Powered by Winston AI
                </div>
                <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                  AI Research Tools
                </h1>
                <p className="text-purple-100 text-lg max-w-2xl">
                  Upload your document for instant plagiarism and AI content
                  detection
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 via-blue-600 to-gray-200 rounded-xl flex items-center justify-center text-white mb-3">
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
              {/* Tabs */}
              <div className="bg-gradient-to-r from-blue-50 via-gray-100 to-blue-50 px-8 py-6">
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveTab("plagiarism");
                      setFile(null);
                      setError(null);
                    }}
                    className={`px-8 py-3 font-semibold transition-all flex items-center justify-center gap-2 rounded-2xl ${
                      activeTab === "plagiarism"
                        ? "bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-lg scale-105"
                        : "bg-white text-blue-700 hover:bg-blue-50 shadow-md"
                    }`}
                  >
                    {activeTab === "plagiarism" && <CheckCircle size={18} />}
                    Plagiarism Check
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("summarize");
                      setFile(null);
                      setError(null);
                    }}
                    className={`px-8 py-3 font-semibold transition-all flex items-center justify-center gap-2 rounded-2xl ${
                      activeTab === "summarize"
                        ? "bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-lg scale-105"
                        : "bg-white text-blue-700 hover:bg-blue-50 shadow-md"
                    }`}
                  >
                    {activeTab === "summarize" && <CheckCircle size={18} />}
                    Summarize
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8">
                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-700 font-medium">Error</p>
                      <p className="text-red-600 text-sm whitespace-pre-line">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                {activeTab === "plagiarism" && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      How it works
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • <strong>AI Content Detection:</strong> Ensemble model
                        (Desklib)
                      </li>
                      <li>
                        • <strong>Supported formats:</strong> TXT, DOCX, PDF (up
                        to 10MB)
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === "summarize" && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      How it works
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • <strong>Smart Summarization:</strong> Automatically
                        uses the best available method
                      </li>
                      <li>
                        • <strong>Priority:</strong> Chrome AI → Fallback
                        Algorithm
                      </li>
                      <li>
                        • <strong>Supported formats:</strong> .txt and .docx
                        files (up to 10MB)
                      </li>
                      <li>
                        • <strong>Note:</strong> Chrome AI requires Chrome
                        Canary with flags enabled
                      </li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-blue-300">
                      <p className="text-xs text-blue-600">
                        <strong>API Status:</strong>{" "}
                        {typeof window !== "undefined" && "Summarizer" in window
                          ? "Summarizer API detected"
                          : "Summarizer API not available"}
                        {/* {" | "}
                        {typeof window !== "undefined" &&
                        "AILanguageModel" in window
                          ? "Prompt API detected"
                          : "Prompt API not available"} */}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        <strong>Browser:</strong> Chrome{" "}
                        {navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-gray-100 scale-[1.02]"
                      : "border-gray-400 bg-gradient-to-br from-gray-50/50 to-blue-50/50 hover:border-blue-400 hover:shadow-lg"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gray-400 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gray-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gray-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gray-400 rounded-br-lg"></div>

                  <div
                    className="w-20 h-20 bg-gradient-to-br from-blue-900 to-gray-400
 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  >
                    <Upload className="w-10 h-10 text-white" />
                  </div>

                  <p className="text-xl font-bold text-gray-800 mb-2">
                    {file ? `📄 ${file.name}` : "Drag & drop your file here"}
                  </p>
                  <p className="text-gray-500 mb-6">
                    or click below to browse • Supports .PDF, .TXT, .DOCX • up
                    to 10MB
                  </p>

                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.doc,.docx"
                    className="hidden"
                    id="fileUpload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="fileUpload"
                    className={`cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-2xl hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          {activeTab === "plagiarism"
                            ? "Check Plagiarism & AI"
                            : "Generate Summary"}
                        </>
                      )}
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
