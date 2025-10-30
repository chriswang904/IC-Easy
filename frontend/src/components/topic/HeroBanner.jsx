import React from "react";
import { Zap, BookOpen } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
      {/* Background Image */}
      <img
        src="/images/mainPage.jpg"
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Optional: Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Discover Your Next Academic Journey
        </h1>
        <p className="text-purple-100 mb-6">
          AI-powered research assistant for smarter paper discovery and writing
        </p>
        <div className="flex gap-3">
          <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg">
            <Zap size={18} />
            Get Started
          </button>
          <button className="bg-white/90 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-white transition flex items-center gap-2 shadow-lg">
            <BookOpen size={18} />
            Browse 10M+ Papers
          </button>
        </div>
      </div>
    </section>
  );
}
