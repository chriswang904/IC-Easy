import React, { useState } from "react";
import {
  Search,
  FileText,
  BookMarked,
  Sparkles,
  FileEdit,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Shield,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Search,
      title: "Smart Essay Search",
      route: "",
      description:
        "Access the latest academic essays and papers from CrossRef, OpenAlex, and arXiv. Find exactly what you need with powerful search filters.",
      benefits: [
        "Browse latest academic essays",
        "Search multiple databases",
        "Advanced filtering options",
        "Real-time updates",
      ],
    },
    {
      icon: FileText,
      title: "TextLab",
      route: "aitool",
      description:
        "Upload documents for instant plagiarism detection and AI-powered summarization. Ensure originality and save time with automated analysis.",
      benefits: [
        "Advanced plagiarism detection",
        "AI-powered summaries",
        "Multiple file formats",
        "Instant results",
      ],
    },
    {
      icon: BookMarked,
      title: "Collections",
      route: "collections",
      description:
        "Build your personal research library with custom collections. Organize papers by topics and projects for easy access.",
      benefits: [
        "Save papers for later",
        "Create custom collections",
        "Organize by projects",
        "Access anywhere",
      ],
    },
    {
      icon: Sparkles,
      title: "Polish",
      route: "polish",
      description:
        "Perfect your academic writing with intelligent editing tools. Get grammar checks, style suggestions, and clarity improvements.",
      benefits: [
        "Advanced grammar checking",
        "Smart rephrasing",
        "Style improvements",
        "Real-time feedback",
      ],
    },
    {
      icon: FileEdit,
      title: "Google Docs Integration",
      route: "essay/:id",
      description:
        "Write directly on our platform with automatic Google Drive synchronization. Your work is always backed up and accessible.",
      benefits: [
        "One-click Google login",
        "Real-time sync",
        "Auto-save to Drive",
        "Work from any device",
      ],
    },
  ];

  const stats = [
    { icon: Users, value: "50,000+", label: "Active Students" },
    { icon: FileText, value: "1M+", label: "Papers Analyzed" },
    { icon: Star, value: "4.8/5", label: "User Rating" },
    { icon: Shield, value: "100%", label: "Secure & Private" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Graduate Student, MIT",
      content:
        "This platform has transformed how I conduct research. The search features are incredibly powerful and save me hours every week.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Undergraduate, Stanford",
      content:
        "The plagiarism checker and writing tools have helped me maintain academic integrity while improving my writing skills significantly.",
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Assistant Professor, Harvard",
      content:
        "I recommend this to all my students. It's an essential tool for modern academic work and research management.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-400 via-pink-300 to-purple-300 text-gray-900 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-purple-300/40">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Trusted by 50,000+ students worldwide
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
              Write Better.
              <br />
              Research Smarter.
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Your complete academic toolkit for research, writing, and
              organization. Join thousands of students achieving excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/login")}
                className="group px-8 py-4 bg-purple-500 text-white rounded-lg font-semibold text-lg hover:bg-purple-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all"
              >
                Explore Features
              </button>
            </div>

            <p className="mt-6 text-gray-700 text-sm">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-12 md:h-20"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C360,0 720,0 1080,64 C1440,128 1440,128 1440,128 L1440,120 L0,120 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-12 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <Icon className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Five powerful tools designed to help you research, write, and
              organize like a pro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredFeature(idx)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`group relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer ${
                    hoveredFeature === idx
                      ? "border-purple-400 shadow-2xl scale-105 bg-gradient-to-br from-purple-50 to-pink-50"
                      : "border-purple-100 shadow-lg hover:border-pink-300"
                  }`}
                  onClick={() => navigate(`/${feature.route}`)}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-6 shadow-lg transition-transform ${
                      hoveredFeature === idx ? "scale-110" : ""
                    }`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-3 text-sm text-gray-700"
                      >
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center text-purple-500 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Learn more
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Students & Educators
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-pink-400 text-pink-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-xl text-gray-800 mb-10">
            Join 50,000+ students who are already writing better and researching
            smarter.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="group px-10 py-5 bg-white text-purple-500 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-flex items-center gap-3"
          >
            Get Started Free
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-gray-800">
            No credit card required • 2 minutes to set up
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 text-gray-700 py-12 border-t border-purple-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium">
            © 2025 Your Research Platform. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Empowering students worldwide to achieve academic excellence
          </p>
        </div>
      </div>
    </div>
  );
}
