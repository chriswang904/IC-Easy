// frontend/src/components/references/ReferenceToolbar.jsx

import React from "react";
import { FileText, Download } from "lucide-react";
import FormatSelector from "./FormatSelector";
import AddReferenceDialog from "./AddReferenceDialog"; 
import { exportBibtex, exportRis } from "../../api/references";

export default function ReferenceToolbar({ format, setFormat, onAdd }) {
  // Handle exporting of references to BibTeX or RIS files
  const handleExport = async (type) => {
    if (type === "bib") await exportBibtex();
    if (type === "ris") await exportRis();
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border">
      {/* Left Section: format selector + export */}
      <div className="flex items-center gap-3">
        <FormatSelector value={format} onChange={setFormat} />

        {/* Export .bib */}
        <button
          onClick={() => handleExport("bib")}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-1 hover:bg-purple-200 transition"
        >
          <FileText size={16} /> Export .bib
        </button>

        {/* Export .ris */}
        <button
          onClick={() => handleExport("ris")}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg flex items-center gap-1 hover:bg-green-200 transition"
        >
          <Download size={16} /> Export .ris
        </button>
      </div>

      {/* Right Section: new AddReferenceDialog */}
      <AddReferenceDialog onAdd={onAdd} />
    </div>
  );
}
