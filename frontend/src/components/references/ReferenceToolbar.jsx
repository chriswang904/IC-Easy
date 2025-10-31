// frontend/src/components/references/ReferenceToolbar.jsx

import React from "react";
import { Copy, FileDown } from "lucide-react";
import FormatSelector from "./FormatSelector";
import AddReferenceDialog from "./AddReferenceDialog";
import { exportBibtex, exportRis } from "../../api/references";

export default function ReferenceToolbar({
  format,
  setFormat,
  onAdd,
  onCopyAll,
}) {
  // Handle exporting of references to BibTeX or RIS files
  const handleExport = async (type) => {
    if (type === "bib") await exportBibtex();
    if (type === "ris") await exportRis();
  };

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
      {/* Left Section: format selector */}
      <FormatSelector value={format} onChange={setFormat} />

      {/* Right Section: actions */}
      <div className="flex items-center gap-2">
        {/* Export dropdown or buttons */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => handleExport("bib")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            .bib
          </button>
          <button
            onClick={() => handleExport("ris")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            .ris
          </button>
        </div>

        <button
          onClick={onCopyAll}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy all
        </button>

        <AddReferenceDialog onAdd={onAdd} />
      </div>
    </div>
  );
}
