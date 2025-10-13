import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  BookMarked,
  Sparkles,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Smart Essay Search",
      route: "",
      tagline: "Discover Research Across Multiple Databases",
      description:
        "Access the latest academic essays and papers from leading research databases. Our powerful search engine connects you to CrossRef, OpenAlex, and arXiv, giving you comprehensive coverage of scholarly work.",
      color: "bg-purple-600",
      lightColor: "bg-purple-100",
      textColor: "text-purple-700",
      features: [
        "Browse the latest academic essays",
        "Search across CrossRef, OpenAlex & arXiv",
        "Advanced filters for precise results",
        "Real-time research updates",
      ],
    },
    {
      icon: FileText,
      title: "TextLab",
      route: "aitool",
      tagline: "Analyze & Summarize Your Documents",
      description:
        "Upload your documents for instant plagiarism detection and AI-powered summarization. Ensure your work's originality while saving time with automated analysis that understands academic content.",
      color: "bg-pink-600",
      lightColor: "bg-pink-100",
      textColor: "text-pink-700",
      features: [
        "Plagiarism detection technology",
        "AI-powered document summaries",
        "Support for multiple file formats",
        "Instant results and insights",
      ],
    },
    {
      icon: BookMarked,
      title: "Collections",
      route: "collections",
      tagline: "Organize Your Research Library",
      description:
        "Build your personal research library with custom collections. Create topics and subjects to organize papers, making it easy to find and manage your research materials for different projects.",
      color: "bg-purple-700",
      lightColor: "bg-purple-100",
      textColor: "text-purple-800",
      features: [
        "Save papers for later reading",
        "Create custom topics & subjects",
        "Organize by projects",
        "Access from anywhere",
      ],
    },
    {
      icon: Sparkles,
      title: "Polish",
      route: "polish",
      tagline: "Refine Your Writing Instantly",
      description:
        "Perfect your academic writing with our intelligent editing tools. Check grammar, get style suggestions, and rephrase sentences for clarity and impact. Make your writing shine with just a few clicks.",
      color: "bg-pink-500",
      lightColor: "bg-pink-100",
      textColor: "text-pink-600",
      features: [
        "Advanced grammar checking",
        "Smart rephrasing suggestions",
        "Style improvement tips",
        "Real-time writing feedback",
      ],
    },
    {
      icon: FileEdit,
      title: "Google Docs Integration",
      route: "essay/:id",
      tagline: "Write With Seamless Cloud Sync",
      description:
        "Connect your Google account and write directly on our platform. Everything you create is automatically synchronized to your Google Drive, ensuring your work is always backed up and accessible.",
      color: "bg-purple-500",
      lightColor: "bg-purple-100",
      textColor: "text-purple-600",
      features: [
        "One-click Google account connection",
        "Real-time cloud synchronization",
        "Auto-save to Google Drive",
        "Work from any device",
      ],
    },
  ];

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setActiveSlide((prev) => (prev + 1) % features.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setActiveSlide((prev) => (prev - 1 + features.length) % features.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goToSlide = (index) => {
    if (!isAnimating && index !== activeSlide) {
      setIsAnimating(true);
      setActiveSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnimating]);

  const currentFeature = features[activeSlide];
  const Icon = currentFeature.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 border-8 border-purple-200">
      {/* Hero Section */}
      <div className="relative py-2 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 text-gray-900">
            Your Research. Elevated.
          </h1>
          <p className="text-xl text-gray-600">
            Five powerful tools designed for academic excellence
          </p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-6xl mx-auto px-6 pb-20 pt-4">
        <div className="relative">
          {/* Main Carousel Card */}
          <div
            className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500 border border-gray-200 ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <div className="relative grid md:grid-cols-2 gap-12 p-12 md:p-16">
              {/* Left Side - Content */}
              <div className="flex flex-col justify-center space-y-6">
                <div
                  className={`inline-flex w-20 h-20 rounded-2xl ${currentFeature.color} items-center justify-center shadow-lg`}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Feature {activeSlide + 1} of {features.length}
                  </div>
                  <h2 className="text-5xl font-bold mb-3 text-gray-900">
                    {currentFeature.title}
                  </h2>
                  <p
                    className={`text-2xl font-medium ${currentFeature.textColor} mb-6`}
                  >
                    {currentFeature.tagline}
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentFeature.description}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      navigate(`/${currentFeature.route}`);
                    }}
                    className={`px-8 py-4 ${currentFeature.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
                  >
                    Explore {currentFeature.title}
                  </button>
                </div>
              </div>

              {/* Right Side - Feature List */}
              <div className="flex flex-col justify-center">
                <div
                  className={`${currentFeature.lightColor} rounded-2xl p-8 shadow-md border border-gray-100`}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Key Features
                  </h3>
                  <ul className="space-y-4">
                    {currentFeature.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-4 group">
                        <div
                          className={`w-8 h-8 rounded-full ${currentFeature.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                        >
                          <Circle className="w-3 h-3 fill-white text-white" />
                        </div>
                        <span className="text-gray-700 text-lg pt-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 bg-white border-2 border-purple-200 rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:border-purple-300 transition-all text-gray-800"
            disabled={isAnimating}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 bg-white border-2 border-purple-200 rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:border-purple-300 transition-all text-gray-800"
            disabled={isAnimating}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center items-center gap-3 mt-12">
          {features.map((feature, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className="group relative"
              disabled={isAnimating}
            >
              <div
                className={`transition-all duration-300 rounded-full ${
                  idx === activeSlide
                    ? "w-12 h-3 bg-purple-600"
                    : "w-3 h-3 bg-purple-300 hover:bg-purple-400"
                }`}
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {feature.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t-4 border-purple-200 py-16 px-6 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Start Your Research Journey Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of researchers and students worldwide
          </p>
          <button
            className="bg-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => {
              navigate(`/login`);
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
