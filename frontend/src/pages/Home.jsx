import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  FileText,
  BookMarked,
  Sparkles,
  FileEdit,
  Torus,
  ArrowRight,
  Star,
  Users,
  Shield,
  Zap,
  Brain,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    papers: 0,
    rating: 0,
  });
  const heroRef = useRef(null);
  const [particles, setParticles] = useState([]);

  // Mouse tracking for gradient effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated counter for stats
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        users: Math.floor(50000 * progress),
        papers: Math.floor(1000000 * progress),
        rating: (4.8 * progress).toFixed(1),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

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
      color: "from-purple-400 to-pink-400",
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
      color: "from-blue-400 to-blue-200",
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
      color: "from-pink-400 to-pink-300",
    },
    {
      icon: FileEdit,
      title: "Smart Editor",
      route: "essay/:id",
      description:
        "Write and polish your papers in one place with our intelligent editor. Automatic Google Drive sync keeps your work safe while AI-powered tools perfect your writing.",
      benefits: [
        "Advanced grammar & style checking",
        "Smart rephrasing suggestions",
        "Auto-save to Google Drive",
        "Real-time feedback",
      ],
      color: "from-amber-400 to-orange-400",
    },
  ];

  const stats = [
    {
      icon: Shield,
      value: "100%",
      animatedValue: 100,
      label: "Secure & Private",
      suffix: "%",
    },
    {
      icon: Zap,
      value: "10x",
      animatedValue: 10,
      label: "Faster Analysis",
      suffix: "x",
    },
    {
      icon: Brain,
      value: "AI",
      animatedValue: null, // No animation for text
      label: "Powered Intelligence",
      suffix: "",
    },
    {
      icon: Clock,
      value: "24/7",
      animatedValue: 24,
      label: "Available Support",
      suffix: "/7",
    },
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

  // 3D tilt effect for feature cards
  const handleCardMouseMove = (e, idx) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleCardMouseLeave = (e) => {
    e.currentTarget.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Interactive Elements */}
      <div
        ref={heroRef}
        className="relative bg-gradient-to-br from-purple-400 via-pink-300 to-purple-300 text-gray-900 overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(219, 39, 119, 0.3), transparent 50%)`,
        }}
      >
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {/* Decorative background elements with parallax */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>
        </div>

        <div
          className="relative max-w-7xl mx-auto px-6 py-20 md:py-32"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-purple-300/40 hover:scale-105 transition-transform cursor-pointer">
              <Zap className="w-4 h-4 text-purple-600 animate-pulse" />
              <span className="text-sm font-medium text-purple-900">
                Trusted by 50,000+ students worldwide
              </span>
            </div> */}

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 animate-fade-in">
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
                className="group px-8 py-4 bg-purple-400 text-white rounded-lg font-semibold text-lg hover:bg-purple-500 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1) rotate(2deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all hover:scale-105"
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

        <style>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out;
          }
        `}</style>
      </div>

      {/* Stats Bar with Animated Counters */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-12 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="text-center transform hover:scale-110 transition-transform cursor-pointer"
                >
                  <Icon className="w-8 h-8 text-purple-500 mx-auto mb-3 animate-bounce" />
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

      {/* Features Section with 3D Tilt Effect */}
      {/* Features Section with Auto-scroll Carousel */}
      <div id="features" className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four powerful tools designed to help you research, write, and
              organize like a pro.
            </p>
          </div>

          {/* Scrolling container */}
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex gap-8 animate-scroll">
                {/* Triple the features for smoother loop */}
                {[...features, ...features, ...features].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredFeature(idx)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      className={`group relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer flex-shrink-0 w-[350px] ${
                        hoveredFeature === idx
                          ? "border-purple-400 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50"
                          : "border-purple-100 shadow-lg hover:border-pink-300"
                      }`}
                      onClick={() => navigate(`/${feature.route}`)}
                    >
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                          feature.color
                        } flex items-center justify-center mb-6 shadow-lg transition-transform ${
                          hoveredFeature === idx ? "rotate-12" : ""
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
                            className="flex items-start gap-3 text-sm text-gray-700 transform transition-transform hover:translate-x-2"
                          >
                            <Torus className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
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
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * 4 - 2rem * 4));
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Academic Writing?
          </h2>
          <p className="text-xl text-gray-800 mb-10">
            Start analyzing your papers with AI-powered insights in minutes.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="group px-10 py-5 bg-white text-purple-500 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-flex items-center gap-3"
          >
            Get Started
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-gray-800">
            No credit card required • Start analyzing in 2 minutes
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
