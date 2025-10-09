// pages/PlagiarismResultPage.jsx - AI-Only Simplified Version

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  FileText,
  Download,
  Shield,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function PlagiarismResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      console.log("[AI Result] Received data:", location.state.result);
    } else {
      navigate("/aitool");
    }
  }, [location, navigate]);

  if (!result) {
    return <div>Loading...</div>;
  }

  const aiPercent =
    result.ai_probability !== undefined && result.ai_probability !== null
      ? (Number(result.ai_probability) || 0) 
      : 0;

  const safeToFixed = (value, digits = 1) => {
    const num = Number(value);
    return isNaN(num) ? "0.0" : num.toFixed(digits);
  };

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
                    AI Detection Result
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

            {/* AI Detection Summary */}
            <div
              className={`p-6 rounded-2xl border-2 mb-6 ${
                result.is_ai_generated
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-blue-50 border-blue-200 text-blue-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">AI Content Detection</h3>
                <Brain className="w-6 h-6" />
              </div>
              <p className="text-5xl font-bold mb-2">
                {safeToFixed(aiPercent, 1)}%
              </p>
              <p className="text-md mb-2">
                {result.is_ai_generated
                  ? "Likely AI-Generated"
                  : "Likely Human-Written"}
              </p>
              <p className="text-sm opacity-75">
                Method: {result.details.ai_detection.method}
              </p>
            </div>

            {/* Risk Summary */}
            <div
              className={`p-5 rounded-2xl border-2 mb-8 ${
                result.is_ai_generated
                  ? "bg-orange-50 border-orange-300"
                  : "bg-green-50 border-green-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Overall Assessment</h3>
                  <p className="text-sm capitalize">
                    Risk Level:{" "}
                    <span className="font-bold">
                        {result.overall_risk
                        ? `${result.overall_risk.replace("_", " ")}${result.is_ai_generated ? " (AI Detected)" : " (Human-Written)"}`
                        : result.is_ai_generated
                        ? "High (AI Detected)"
                        : "Low (Human-Written)"}
                    </span>
                    </p>
                </div>
                <Shield className="w-8 h-8" />
              </div>
            </div>

            {/* AI Detection Details */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Detection Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Probability:</span>
                  <span className="font-semibold">
                    {safeToFixed(aiPercent, 2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classification:</span>
                  <span
                    className={`font-semibold ${
                      result.is_ai_generated
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {result.is_ai_generated ? "AI-Generated" : "Human-Written"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Detection Method:</span>
                  <span className="font-semibold text-xs">
                    {result.details.ai_detection.method}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recommendations
              </h2>
              {result.is_ai_generated ? (
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-800">
                      AI-Generated Content Detected
                    </p>
                    <p className="text-orange-700 mt-1">
                      This text appears to have been generated by AI.
                      Consider rewriting in your own words or adding clear disclosure.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">
                      Content Looks Human-Written
                    </p>
                    <p className="text-green-700 mt-1">
                      Your text shows no signs of AI generation — good job!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamp */}
            {result.timestamp && (
              <div className="mt-6 text-center text-xs text-gray-500">
                Analysis completed at:{" "}
                {new Date(result.timestamp).toLocaleString()}
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
