// src/components/paper/PaperList.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';
import PaperCard from './PaperCard';

export default function PaperList({ papers, onPaperClick }) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">
          No papers found. Try a different search.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4 mt-8">
      {papers.map((paper) => (
        <PaperCard
          key={paper.id}
          paper={paper}
          onClick={onPaperClick}
        />
      ))}
    </section>
  );
}