// frontend/src/components/knowledge/GraphToolbar.jsx
import React from "react";

export default function GraphToolbar({ currentView, onChange }) {
  const tabs = [
    { key: "citation", label: "Citation Graph" },
    { key: "author", label: "Author Network" },
    { key: "topic", label: "Topic Evolution" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1 rounded-lg border ${
            currentView === t.key ? "bg-purple-600 text-white border-purple-600" : "hover:bg-gray-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
