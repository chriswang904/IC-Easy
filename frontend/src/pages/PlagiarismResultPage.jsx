// pages/PlagiarismResultPage.jsx - 完整文件

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, Brain, FileText, Download, Shield } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function PlagiarismResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      console.log("[Plagiarism Result] Received data:", location.state.result);
    } else {
      navigate("/aitool");
    }
  }, [location, navigate]);

  if (!result) {
    return <div>Loading...</div>;
  }

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return <CheckCircle className="w-6 h-6" />;
      case "medium":
      case "high":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6" style={{ marginLeft: "5vw" }}>
          <article className="bg-white rounded-3xl shadow-xl p-8 max-w-6xl">
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
                    Analysis Results
                  </h1>
                  {result.filename && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <FileText size={16} />
                      {result.filename}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Download size={18} />
                Export Report
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Plagiarism Risk */}
              <div
                className={`p-6 rounded-2xl border-2 ${getRiskColor(
                  result.plagiarism_risk
                )}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Plagiarism Risk</h3>
                  {getRiskIcon(result.plagiarism_risk)}
                </div>
                <p className="text-4xl font-bold mb-1">
                  {(result.plagiarism_probability * 100).toFixed(1)}%
                </p>
                <p className="text-sm capitalize mb-2">
                  {result.plagiarism_risk} Risk
                </p>
                <p className="text-xs opacity-75">
                  Powered by Longformer AI Model
                </p>
              </div>

              {/* AI Detection */}
              {result.ai_probability !== null && result.ai_probability !== undefined && (
                <div
                  className={`p-6 rounded-2xl border-2 ${
                    result.is_ai_generated
                      ? "bg-orange-50 border-orange-200 text-orange-600"
                      : "bg-blue-50 border-blue-200 text-blue-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">AI Content Detection</h3>
                    <Brain className="w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold mb-1">
                    {(result.ai_probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm mb-2">
                    {result.is_ai_generated
                      ? "Likely AI-Generated"
                      : "Likely Human-Written"}
                  </p>
                  <p className="text-xs opacity-75 capitalize">
                    Confidence: {result.ai_confidence || "N/A"}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Plagiarism Details */}
              {result.details?.plagiarism && (
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Plagiarism Analysis
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Detection Method:</span>
                      <span className="font-semibold capitalize">
                        {result.details.plagiarism.method || "Longformer"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`font-semibold capitalize ${
                        result.plagiarism_risk === "high" ? "text-red-600" :
                        result.plagiarism_risk === "medium" ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {result.plagiarism_risk}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Probability Score:</span>
                      <span className="font-semibold">
                        {(result.plagiarism_probability * 100).toFixed(2)}%
                      </span>
                    </div>
                    {result.details.plagiarism.error && (
                      <div className="mt-3 p-3 bg-yellow-100 rounded text-xs text-yellow-800">
                        Note: {result.details.plagiarism.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Detection Details */}
              {result.details?.ai && result.details.ai.status === "success" && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Detection Details
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Probability:</span>
                      <span className="font-semibold">
                        {(result.ai_probability * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classification:</span>
                      <span className={`font-semibold ${
                        result.is_ai_generated ? "text-orange-600" : "text-blue-600"
                      }`}>
                        {result.is_ai_generated ? "AI-Generated" : "Human-Written"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold capitalize">
                        {result.ai_confidence}
                      </span>
                    </div>
                    {result.details.ai.details?.models_used && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-gray-600 mb-2">Models Used:</p>
                        <ul className="text-xs space-y-1">
                          {result.details.ai.details.models_used.map((model, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              {model}
                            </li>
                          ))}
                        </ul>
                        {result.details.ai.details.probabilities && (
                          <div className="mt-2 text-xs text-gray-600">
                            Individual scores: {' '}
                            {Object.entries(result.details.ai.details.probabilities).map(
                              ([key, val], idx) => (
                                <span key={idx}>
                                  {key}: {(val * 100).toFixed(1)}%
                                  {idx < Object.keys(result.details.ai.details.probabilities).length - 1 && ', '}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recommendations
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                {result.plagiarism_risk === "high" && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">High Plagiarism Risk Detected</p>
                      <p className="text-red-700">Review your content for proper citations and original phrasing.</p>
                    </div>
                  </div>
                )}
                
                {result.plagiarism_risk === "medium" && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Medium Plagiarism Risk</p>
                      <p className="text-yellow-700">Consider rephrasing sections and adding proper citations.</p>
                    </div>
                  </div>
                )}

                {result.is_ai_generated && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Brain className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-800">AI-Generated Content Detected</p>
                      <p className="text-orange-700">
                        This text appears to be generated by AI. Ensure proper disclosure if required.
                      </p>
                    </div>
                  </div>
                )}

                {result.plagiarism_risk === "low" && !result.is_ai_generated && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">Content Looks Good!</p>
                      <p className="text-green-700">
                        Your text shows low plagiarism risk and appears to be human-written.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamp */}
            {result.timestamp && (
              <div className="mt-6 text-center text-xs text-gray-500">
                Analysis completed at: {new Date(result.timestamp).toLocaleString()}
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}