// src/components/paper/PaperCard.jsx
import React from 'react';
import { Star, AlertCircle } from 'lucide-react';

export default function PaperCard({ paper, onClick }) {
  return (
    <article
      onClick={() => onClick(paper)}
      className="flex items-start gap-4 p-4 hover:bg-purple-50 rounded-2xl transition group cursor-pointer border border-transparent hover:border-purple-200"
    >
      <div className="w-20 h-20 flex-shrink-0">
        <img
          src={paper.image}
          alt={paper.title}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition flex-1">
            {paper.title}
          </h2>
          {paper.source && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                paper.source === "arxiv"
                  ? "bg-orange-100 text-orange-700"
                  : paper.source === "crossref"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {paper.source === "arxiv"
                ? "arXiv"
                : paper.source === "crossref"
                ? "CrossRef"
                : "OpenAlex"}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium text-purple-600">
            {paper.category}
          </span>{" "}
          • {paper.metadata}
        </p>

        {paper.authors && paper.authors.length > 0 && (
          <p className="text-xs text-gray-500 mb-1">
            {paper.authors.slice(0, 3).join(", ")}
            {paper.authors.length > 3 &&
              ` +${paper.authors.length - 3} more`}
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-2">
          {paper.description}
        </p>

        {paper.source === "arxiv" && (
          <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span className="italic">
              Preprint - citation data not available
            </span>
          </p>
        )}
      </div>

      <button className="p-2 hover:bg-purple-100 rounded-full transition opacity-0 group-hover:opacity-100">
        <Star className="w-5 h-5 text-gray-400" />
      </button>
    </article>
  );
}