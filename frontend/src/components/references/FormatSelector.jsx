// src/components/references/FormatSelector.jsx
import React from "react";

export default function FormatSelector({ value, onChange }) {
  const formats = [
    { value: "apa", label: "APA" },
    { value: "mla", label: "MLA" },
    { value: "ieee", label: "IEEE" },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {formats.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            value === f.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
