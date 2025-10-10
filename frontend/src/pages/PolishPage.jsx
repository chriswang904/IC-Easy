// pages/PolishPage.jsx

import React, { useState, useEffect } from "react";
import {
  Wand2,
  FileText,
  Sparkles,
  Target,
  Zap,
  Loader,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  RefreshCw,
  Type,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function PolishPage() {
  const [isToneOpen, setIsToneOpen] = useState(false);
  const [isLengthOpen, setIsLengthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("grammar");
  const [inputText, setInputText] = useState("");
  const [polishedText, setPolishedText] = useState("");
  const [isHTML, setIsHTML] = useState(false);
  const [correctionCount, setCorrectionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [tone, setTone] = useState("as-is");
  const [length, setLength] = useState("as-is");
  const [apiStatus, setApiStatus] = useState({
    proofreader: false,
    rewriter: false,
  });

  // Check Chrome APIs availability on mount
  useEffect(() => {
    const checkAPIs = async () => {
      console.log("=== Chrome AI APIs Diagnostics ===");

      // Check Proofreader API
      if ("Proofreader" in window && window.Proofreader) {
        try {
          const availability = await window.Proofreader.availability();
          if (availability === "readily" || availability === "downloadable") {
            console.log("Proofreader API is AVAILABLE!");
            setApiStatus((prev) => ({ ...prev, proofreader: true }));
          }
        } catch (err) {
          console.error("Proofreader API check error:", err);
        }
      }

      // Check Rewriter API - using the correct API name
      if ("Rewriter" in window && window.Rewriter) {
        try {
          const availability = await window.Rewriter.availability();
          console.log("Rewriter availability:", availability);
          if (availability === "readily" || availability === "after-download") {
            console.log("Rewriter API is AVAILABLE!");
            setApiStatus((prev) => ({ ...prev, rewriter: true }));
          }
        } catch (err) {
          console.error("Rewriter API check error:", err);
        }
      }

      console.log("API Status check complete");
    };

    checkAPIs();
  }, []);

  useEffect(() => {
    setPolishedText("");
    setIsHTML(false);
    setCorrectionCount(0);
    setError(null);
  }, [activeTab]);

  const polishWithFallback = (text) => {
    console.log("[Polish] Using fallback algorithm...");

    try {
      let result = text
        .replace(/\s+/g, " ")
        .replace(/\s+([.,!?;:])/g, "$1")
        .replace(/([.,!?;:])([a-zA-Z])/g, "$1 $2")
        .replace(
          /([.!?])\s+([a-z])/g,
          (match, p1, p2) => `${p1} ${p2.toUpperCase()}`
        )
        .replace(/\bi\b/g, "I")
        .replace(/^([a-z])/, (match) => match.toUpperCase())
        .trim();

      return {
        result:
          result +
          "\n\n---\n⚠️ Note: Chrome Proofreader API is not available. This was processed using a basic algorithm.",
        method: "fallback-algorithm",
      };
    } catch (err) {
      console.error("[Polish] Fallback error:", err);
      return {
        result: text + "\n\n---\n⚠️ Error: Could not process text.",
        method: "error",
      };
    }
  };

  const polishWithProofreader = async (text) => {
    console.log("[Polish] Attempting to use Chrome Proofreader API...");

    if ("Proofreader" in window && window.Proofreader) {
      try {
        const availability = await window.Proofreader.availability();
        console.log("[Polish] Proofreader availability:", availability);

        if (availability === "no") {
          return polishWithFallback(text);
        }

        const proofreader = await window.Proofreader.create({
          expectedInputLanguages: ["en"],
          expectedOutputLanguage: "en",
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(
                `[Polish] Model download progress: ${e.loaded * 100}%`
              );
            });
          },
        });

        const proofreadResult = await proofreader.proofread(text);
        console.log("[Polish] Proofread result:", proofreadResult);

        if (
          !proofreadResult.corrections ||
          proofreadResult.corrections.length === 0
        ) {
          proofreader.destroy();
          return {
            result: text + "\n\n No grammar errors detected!",
            isHTML: false,
            method: "Proofreader",
          };
        }

        const sortedCorrections = [...proofreadResult.corrections].sort(
          (a, b) => b.startIndex - a.startIndex
        );

        let highlightedHTML = text;

        for (const corr of sortedCorrections) {
          const original = text.slice(corr.startIndex, corr.endIndex);
          const safeCorrection = corr.correction
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          const safeOriginal = original
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          const highlighted = `<span class="grammar-correction" data-original="${safeOriginal}">${safeCorrection}</span>`;

          highlightedHTML =
            highlightedHTML.substring(0, corr.startIndex) +
            highlighted +
            highlightedHTML.substring(corr.endIndex);
        }

        proofreader.destroy();
        return {
          result: highlightedHTML,
          isHTML: true,
          correctionCount: proofreadResult.corrections.length,
          method: "Proofreader",
        };
      } catch (err) {
        console.error("[Polish] Proofreader API failed:", err);
      }
    }

    return polishWithFallback(text);
  };

  const rephraseWithRewriter = async (text) => {
    console.log("[Rephrase] Attempting to use Chrome Rewriter API...");

    if ("Rewriter" in window && window.Rewriter) {
      try {
        const availability = await window.Rewriter.availability();
        console.log("[Rephrase] Rewriter availability:", availability);

        if (availability === "no") {
          return {
            result:
              text + "\n\n---\n⚠️ Note: Chrome Rewriter API is not available.",
            method: "unavailable",
          };
        }

        // Create rewriter with options
        const options = {
          tone: tone,
          format: "plain-text",
          length: length,
        };

        // Add monitor for download progress if needed
        if (availability !== "readily") {
          options.monitor = (m) => {
            m.addEventListener("downloadprogress", (e) => {
              console.log(
                `[Rephrase] Download progress: ${e.loaded}/${e.total}`
              );
            });
          };
        }

        const rewriter = await window.Rewriter.create(options);

        console.log(
          "[Rephrase] Rewriter session created, starting streaming..."
        );

        // Use streaming API
        const stream = rewriter.rewriteStreaming(text);
        let rephrased = "";

        for await (const chunk of stream) {
          console.log("[Rephrase] Received chunk:", chunk);
          // Accumulate chunks - each chunk is a delta/addition
          rephrased += chunk;
          // Update in real-time during streaming
          setPolishedText(rephrased);
        }

        console.log("[Rephrase] Streaming complete");
        console.log("[Rephrase] Final rephrased text:", rephrased);
        console.log("[Rephrase] Final text length:", rephrased.length);

        // Set final result with metadata
        const finalResult =
          rephrased + `\n\nRephrased (Tone: ${tone}, Length: ${length})`;
        setPolishedText(finalResult);

        rewriter.destroy();

        return {
          result: finalResult,
          method: "Rewriter",
        };
      } catch (err) {
        console.error("[Rephrase] Rewriter API failed:", err);
        return {
          result: text + `\n\n---\n⚠️ Error: ${err.message}`,
          method: "error",
        };
      }
    }

    console.log("[Rephrase] Rewriter API not found");
    return {
      result:
        text +
        "\n\n---\n⚠️ Note: Chrome Rewriter API is not available in this browser.",
      method: "unavailable",
    };
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to process!");
      return;
    }

    setLoading(true);
    setError(null);
    setPolishedText("");
    setIsHTML(false);
    setCorrectionCount(0);

    try {
      let result;

      if (activeTab === "grammar") {
        console.log("[Process] Processing grammar improvement...");
        result = await polishWithProofreader(inputText);

        if (!result || !result.result) {
          throw new Error("No result returned from processing function");
        }

        setPolishedText(result.result);
        setIsHTML(result.isHTML || false);
        setCorrectionCount(result.correctionCount || 0);
      } else {
        console.log("[Process] Processing rephrase...");
        result = await rephraseWithRewriter(inputText);
        // Don't set polishedText here - it's already being set in real-time during streaming
      }

      console.log("[Process] Successfully processed text");
    } catch (err) {
      console.error("[Process] Caught error:", err);
      setError(
        "An unexpected error occurred during text processing.\n\n" +
          `Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    // Extract plain text from HTML if it contains HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = polishedText;
    const plainText = tempDiv.textContent || tempDiv.innerText || polishedText;
    navigator.clipboard.writeText(plainText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    // Extract plain text from HTML if it contains HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = polishedText;
    const plainText = tempDiv.textContent || tempDiv.innerText || polishedText;
    const file = new Blob([plainText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab}-text-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Grammar Correction",
      description: "Fix grammar, spelling, and punctuation errors instantly",
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Smart Rephrasing",
      description: "Rewrite text with different tones and lengths",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Privacy-First",
      description: "All processing happens on your device",
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
                  style={{ backgroundImage: "url('/images/polishPage.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>

              <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute bottom-10 left-20 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                <div className="inline-block mb-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                  ✨ Chrome AI APIs
                </div>
                <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                  Polish Your Writing
                </h1>
                <p className="text-purple-100 text-lg max-w-2xl">
                  Fix grammar errors and rephrase text with Google's on-device
                  AI
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
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 via-yellow-300 to-white-200 rounded-xl flex items-center justify-center text-white mb-3">
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
              <div className="bg-gradient-to-r from-blue-50 via-gray-100 to-blue-50 px-8 py-4">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab("grammar")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      activeTab === "grammar"
                        ? "bg-yellow-300 text-white shadow-lg"
                        : "bg-white text-yellow-400 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle size={20} />
                    Grammar Check
                  </button>
                  <button
                    onClick={() => setActiveTab("rephrase")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      activeTab === "rephrase"
                        ? "bg-yellow-300 text-white shadow-lg"
                        : "bg-white text-yellow-400 hover:bg-gray-50"
                    }`}
                  >
                    <RefreshCw size={20} />
                    Rephrase
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
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {activeTab === "grammar"
                      ? "Grammar Check"
                      : "Rephrase Text"}
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {activeTab === "grammar" ? (
                      <>
                        <li>• Corrects grammar and spelling mistakes</li>
                        <li>• Fixes punctuation errors</li>
                        <li>• Uses Chrome's on-device Proofreader API</li>
                        <li>
                          • Falls back to basic algorithm if API unavailable
                        </li>
                      </>
                    ) : (
                      <>
                        <li>• Rewrites text with different tones and styles</li>
                        <li>• Adjust length (shorter, longer, or as-is)</li>
                        <li>• Uses Chrome's on-device Rewriter API</li>
                        <li>• Choose from formal, neutral, or casual tones</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Rephrase Options */}
                {activeTab === "rephrase" && (
                  <div className="mb-6 flex gap-6">
                    {/* Tone Dropdown */}
                    <div className="relative">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Tone
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => {
                            setIsToneOpen((prev) => !prev);
                            setIsLengthOpen(false); // close other
                          }}
                          className="w-48 px-4 py-3 border-2 border-gray-300 rounded-xl bg-white hover:border-purple-500 flex justify-between items-center transition-all"
                          disabled={loading}
                        >
                          <span className="capitalize">
                            {tone === "as-is"
                              ? "As Is"
                              : tone === "more-formal"
                              ? "More Formal"
                              : "More Casual"}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 text-gray-500 transform transition-transform ${
                              isToneOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {isToneOpen && (
                          <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                            {["as-is", "more-formal", "more-casual"].map(
                              (option) => (
                                <div
                                  key={option}
                                  onClick={() => {
                                    setTone(option);
                                    setIsToneOpen(false);
                                  }}
                                  className={`px-4 py-2 cursor-pointer hover:bg-purple-50 ${
                                    tone === option
                                      ? "bg-purple-100 font-semibold text-purple-700"
                                      : ""
                                  }`}
                                >
                                  {option === "as-is"
                                    ? "As Is"
                                    : option === "more-formal"
                                    ? "More Formal"
                                    : "More Casual"}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Length Dropdown */}
                    <div className="relative">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Length
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => {
                            setIsLengthOpen((prev) => !prev);
                            setIsToneOpen(false); // close other
                          }}
                          className="w-48 px-4 py-3 border-2 border-gray-300 rounded-xl bg-white hover:border-purple-500 flex justify-between items-center transition-all"
                          disabled={loading}
                        >
                          <span className="capitalize">
                            {length === "as-is"
                              ? "As Is"
                              : length === "shorter"
                              ? "Shorter"
                              : "Longer"}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 text-gray-500 transform transition-transform ${
                              isLengthOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {isLengthOpen && (
                          <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                            {["as-is", "shorter", "longer"].map((option) => (
                              <div
                                key={option}
                                onClick={() => {
                                  setLength(option);
                                  setIsLengthOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-purple-50 ${
                                  length === option
                                    ? "bg-purple-100 font-semibold text-purple-700"
                                    : ""
                                }`}
                              >
                                {option === "as-is"
                                  ? "As Is"
                                  : option === "shorter"
                                  ? "Shorter"
                                  : "Longer"}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Your Text
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste or type your text here..."
                    className="w-full h-64 p-4 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none resize-none bg-gradient-to-br from-gray-50/50 to-blue-50/50 text-gray-800"
                    disabled={loading}
                  />
                  <div className="mt-2 text-sm text-gray-500 text-right">
                    {inputText.length} characters
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center mb-6">
                  <button
                    onClick={handleProcess}
                    disabled={loading || !inputText.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-2xl hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        {activeTab === "grammar"
                          ? "Checking..."
                          : "Rephrasing..."}
                      </>
                    ) : (
                      <>
                        {activeTab === "grammar" ? (
                          <>
                            <Wand2 size={20} />
                            Check Grammar
                          </>
                        ) : (
                          <>
                            <RefreshCw size={20} />
                            Rephrase Text
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {/* Result Area */}
                {polishedText && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-gray-700 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {activeTab === "grammar"
                          ? "Corrected Text"
                          : "Rephrased Text"}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopy}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                        >
                          <Copy size={16} />
                          {copySuccess ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <style>{`
                      .grammar-correction {
                        background-color: #86efac !important;
                        padding: 2px 4px;
                        border-radius: 4px;
                        position: relative;
                        cursor: help;
                        display: inline;
                      }
                      .grammar-correction:hover::after {
                        content: "was: " attr(data-original);
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #1f2937;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 12px;
                        white-space: nowrap;
                        z-index: 10;
                        margin-bottom: 4px;
                      }
                    `}</style>
                    <div
                      className="bg-white p-4 rounded-xl border border-green-300 text-gray-800"
                      style={{ lineHeight: "1.8" }}
                    >
                      {isHTML ? (
                        <>
                          <div
                            dangerouslySetInnerHTML={{ __html: polishedText }}
                          />
                          {correctionCount > 0 && (
                            <div className="mt-4 text-green-700 font-medium">
                              Applied {correctionCount} correction
                              {correctionCount > 1 ? "s" : ""}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {polishedText}
                        </div>
                      )}
                    </div>
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
