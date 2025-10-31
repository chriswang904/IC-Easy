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
  Info,
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
      if (fileExtension === ".txt" || file.type === "text/plain") {
        const text = await file.text();
        if (!text || text.trim().length === 0) {
          throw new Error("The text file appears to be empty.");
        }
        return text;
      }

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

      if (fileExtension === ".pdf" || file.type === "application/pdf") {
        throw new Error(
          "PDF text extraction is not yet supported. Please convert to TXT or DOCX format."
        );
      }

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
    const sentences = text
      .replace(/\n+/g, " ")
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    if (sentences.length === 0) {
      throw new Error("No valid sentences found in the text.");
    }

    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;

      if (index === 0) score += 3;
      if (index === sentences.length - 1) score += 2;
      if (index < sentences.length * 0.2) score += 1;

      const wordCount = sentence.split(/\s+/).length;
      if (wordCount >= 10 && wordCount <= 30) score += 2;

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

    const summaryLength = Math.max(
      3,
      Math.min(10, Math.ceil(sentences.length * 0.3))
    );
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryLength)
      .sort((a, b) => a.index - b.index);

    const summary = topSentences.map((s) => `• ${s.sentence}`).join(".\n\n");

    return {
      summary: `**Key Points Summary:**\n\n${summary}.`,
      method: "fallback",
    };
  };

  const summarizeWithChrome = async (text) => {
    console.log("=== Chrome AI Diagnostics ===");
    console.log("'ai' in window:", "ai" in window);
    console.log("'Summarizer' in window:", "Summarizer" in window);
    console.log("'AILanguageModel' in window:", "AILanguageModel" in window);
    console.log("Browser:", navigator.userAgent);

    if (window.ai) {
      console.log("window.ai properties:", Object.keys(window.ai));
    }

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

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex justify-center items-start p-6">
          <article className="bg-white rounded-t-3xl shadow-xl w-[90%] max-w-6xl px-8 py-12 min-h-screen">
            {/* Header Section - Notion Style */}

            <div className="mb-12 text-center">
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Powered by Winston AI
                </span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                Document Analysis
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Upload your document for instant plagiarism detection, AI
                content analysis, and smart summarization
              </p>
            </div>

            {/* Main Content Card - Figma/Notion Style */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Tabs - Minimal Style */}
              <div className="border-b border-gray-200 bg-gray-50/50">
                <div className="flex px-6">
                  <button
                    onClick={() => {
                      setActiveTab("plagiarism");
                      setFile(null);
                      setError(null);
                    }}
                    className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "plagiarism"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Plagiarism Check
                    {activeTab === "plagiarism" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("summarize");
                      setFile(null);
                      setError(null);
                    }}
                    className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "summarize"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Summarize
                    {activeTab === "summarize" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8">
                {/* Error Display - Notion Style */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700 mt-1 whitespace-pre-line">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info Box - Notion Callout Style */}
                <div className="mb-6 p-4 bg-grey-50/50 rounded-lg border border-grey-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-grey-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-grey-900 mb-2">
                        {activeTab === "plagiarism"
                          ? "About Plagiarism Detection"
                          : "About Summarization"}
                      </p>
                      {activeTab === "plagiarism" ? (
                        <div className="text-sm text-grey-800 space-y-1">
                          <p>
                            AI Content Detection using Winston AI ensemble model
                          </p>
                          <p>Supports TXT, DOCX, PDF files up to 10MB</p>
                        </div>
                      ) : (
                        <div className="text-sm text-grey-800 space-y-1">
                          <p>
                            Automatically uses the best available summarization
                            method
                          </p>
                          <p>Supports .txt and .docx files up to 10MB</p>
                          <p className="text-xs text-grey-700 mt-1">
                            Note: Chrome AI requires Chrome Canary with flags
                            enabled
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Area - Figma Style */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300 bg-gray-50/30 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-gray-600" />
                  </div>

                  <p className="text-base font-medium text-gray-900 mb-1">
                    {file ? `📄 ${file.name}` : "Drop your file here"}
                  </p>

                  <p className="text-sm text-gray-500 mb-6">
                    or click below to browse • PDF, TXT, DOCX • up to 10MB
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
                    className={`cursor-pointer bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FileText size={16} />
                    {file ? "Change File" : "Browse Files"}
                  </label>
                </div>

                {/* Action Button - Notion Style */}
                {file && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="bg-gray-300 text-gray-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          {activeTab === "plagiarism"
                            ? "Check Document"
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
