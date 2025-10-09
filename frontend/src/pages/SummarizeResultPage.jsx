// pages/SummarizeResultPage.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  Sparkles,
  CheckCircle,
  Copy,
  FileCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function SummarizeResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.summary) {
      setResult({
        summary: location.state.summary,
        filename: location.state.filename,
        originalLength: location.state.originalLength,
        timestamp: location.state.timestamp,
        method: location.state.method || "fallback", // Track which method was used
      });
      console.log("[Summary Result] Received data:", location.state);
    } else {
      navigate("/aitool");
    }
  }, [location, navigate]);

  const handleCopy = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result?.summary) {
      const blob = new Blob([result.summary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary_${result.filename || "document"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!result) {
    return (
      <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading summary...</p>
        </div>
      </main>
    );
  }

  const summaryWords = result.summary.split(/\s+/).length;
  const originalWords = Math.round(result.originalLength / 5); // Approximate words from character count
  const compressionRatio = ((1 - summaryWords / originalWords) * 100).toFixed(
    1
  );

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6" style={{ marginLeft: "5vw" }}>
          <article className="bg-white rounded-3xl shadow-xl p-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/aitool")}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Document Summary
                  </h1>
                  {result.filename && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <FileText size={16} />
                      {result.filename}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-700">
                    Original Length
                  </h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {result.originalLength.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">characters</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-700">
                    Summary Length
                  </h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {result.summary.length.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">characters</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-700">Compression</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {compressionRatio}%
                </p>
                <p className="text-xs text-gray-600 mt-1">reduction</p>
              </div>
            </div>

            {/* Success Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1 text-gray-800">
                    Summary Generated Successfully
                  </h3>
                  <p className="text-sm text-gray-600">
                    Powered by Google Chrome's Built-in AI Summarizer
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Summary Content */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Summary
              </h2>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                >
                  {result.summary}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                About this Summary
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Generated using Google Chrome's on-device AI model</li>
                <li>• Summary type: Key points extraction</li>
                <li>• Processing is done locally on your device</li>
                <li>• No data is sent to external servers</li>
              </ul>
            </div>

            {/* Timestamp */}
            {result.timestamp && (
              <div className="mt-6 text-center text-xs text-gray-500">
                Summary generated at:{" "}
                {new Date(result.timestamp).toLocaleString()}
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
