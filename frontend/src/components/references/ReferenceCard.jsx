// src/components/references/ReferenceCard.jsx
import React, { useEffect, useState } from "react";
import { formatReference } from "../../api/papers";
import { Copy, Trash2 } from "lucide-react";

export default function ReferenceCard({ refData, format, onDelete }) {
  const [citation, setCitation] = useState("Formatting...");

  useEffect(() => {
    console.log("=== REFERENCE CARD RENDERING ===");
    console.log("Received refData:", refData);

    const fetchCitation = async () => {
      try {
        const formattedAuthors = (refData.authors || []).map((a) =>
          typeof a === "string" ? { name: a } : a
        );

        console.log("Formatted authors for API:", formattedAuthors);

        const literaturePayload = {
          ...refData,
          authors: formattedAuthors,
        };

        console.log("Sending to API:", literaturePayload);

        const res = await formatReference({
          literature: literaturePayload,
          format,
        });

        console.log("API response:", res);

        setCitation(
          res.formatted_reference ||
            res.formatted ||
            "[No formatted text returned]"
        );
      } catch (err) {
        console.error("Formatting failed:", err);
        setCitation("[Error formatting reference]");
      }
    };

    fetchCitation();
  }, [refData, format]);

  return (
    <li className="p-4 bg-gray-50 rounded-xl border hover:border-purple-300 transition flex justify-between items-start">
      <p className="text-sm text-gray-800 whitespace-pre-line flex-1 mr-4">
        {citation}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(citation)}
          className="p-2 hover:bg-purple-100 rounded-lg"
          title="Copy reference"
        >
          <Copy className="w-4 h-4 text-purple-600" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-100 rounded-lg"
          title="Delete reference"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </li>
  );
}
