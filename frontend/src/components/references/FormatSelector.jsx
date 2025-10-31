// src/components/references/FormatSelector.jsx
import React from "react";

export default function FormatSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-400"
    >
      <option value="apa">APA</option>
      <option value="ieee">IEEE</option>
      <option value="mla">MLA</option>
      <option value="bibtex">BibTeX</option>
    </select>
  );
}
