// frontend/src/components/references/AddReferenceDialog.jsx

import React, { useState, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { Plus, X, Upload, Search } from "lucide-react";
import apiClient from "../../api/client"; // axios client
import { formatReference } from "../../api/references"; // backend formatter

/**
 * AddReferenceDialog
 * - Add new citation manually
 * - Supports fetching metadata by DOI/URL
 * - Supports PDF drag/drop metadata extraction
 * - Generates live preview using backend /format-reference
 */
export default function AddReferenceDialog({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("Website");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState([{ first: "", last: "" }]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [publisher, setPublisher] = useState("");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Add another author
  const handleAddAuthor = () =>
    setAuthors([...authors, { first: "", last: "" }]);

  // Update author field
  const handleChangeAuthor = (i, field, val) => {
    const updated = [...authors];
    updated[i][field] = val;
    setAuthors(updated);
  };

  // Reset all fields
  const resetForm = () => {
    setTitle("");
    setAuthors([{ first: "", last: "" }]);
    setYear(new Date().getFullYear());
    setPublisher("");
    setUrl("");
    setPreview("");
  };

  // Save new reference to parent
  // Save new reference to parent
  const handleSave = () => {
    const formattedAuthors = authors
      .filter((a) => a.first?.trim() || a.last?.trim())
      .map((a) => ({
        name: `${a.first?.trim() || ""} ${a.last?.trim() || ""}`.trim(),
      }));

    console.log("=== SAVING REFERENCE ===");
    console.log("Authors input:", authors);
    console.log("Formatted authors:", formattedAuthors);

    const newRef = {
      id: Date.now(),
      title,
      authors: formattedAuthors,
      year,
      publisher,
      url,
      type,
    };

    console.log("New reference object:", newRef);
    console.log("========================");

    onAdd(newRef);
    setIsOpen(false);
    resetForm();
  };

  // Fetch metadata from DOI or URL using backend
  const handleFetchMetadata = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      let endpoint = "";

      // Match DOI pattern
      const doiMatch = trimmed.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
      // Match arXiv pattern
      const arxivMatch = trimmed.match(
        /arxiv\.org\/abs\/([0-9]+\.[0-9]+)(v[0-9]+)?/i
      );

      if (doiMatch) {
        const doi = doiMatch[0];
        endpoint = `/api/literature/doi/${encodeURIComponent(
          doi
        )}?source=crossref`;
      } else if (arxivMatch) {
        const arxivId = arxivMatch[1];
        endpoint = `/api/literature/arxiv/${encodeURIComponent(arxivId)}`;
      } else {
        alert("No valid DOI or arXiv ID detected.");
        return;
      }

      const response = await apiClient.get(endpoint);
      const data = response.data;

      // Apply fetched metadata
      if (data) {
        setTitle(data.title || "");
        setYear(
          data.published_date
            ? parseInt(data.published_date.slice(0, 4))
            : new Date().getFullYear()
        );
        setPublisher(data.publisher || "");
        setAuthors(
          (data.authors || []).map((a) => {
            const parts = a.name ? a.name.split(" ") : [];
            return {
              first: parts[0] || "",
              last: parts.slice(1).join(" ") || "",
            };
          })
        );
        setPreview("");
      }
    } catch (err) {
      console.error("[Metadata Fetch Error]", err);
      alert("Failed to fetch metadata from DOI/arXiv.");
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop PDF to extract metadata
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post(
        "/api/literature/extract-pdf-metadata",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = res.data;
      setTitle(data.title || "");
      setAuthors(
        (data.authors || []).map((a) => ({
          first: a.first || "",
          last: a.last || "",
        }))
      );
      setYear(data.year || new Date().getFullYear());
      setPublisher(data.publisher || "");
      setPreview("");
    } catch (err) {
      console.error("PDF upload failed:", err);
      alert("Failed to extract PDF metadata.");
    } finally {
      setLoading(false);
    }
  };

  // Generate formatted citation preview
  const handlePreview = async () => {
    try {
      const formattedAuthors = authors
        .filter((a) => a.first || a.last)
        .map((a) => ({ name: `${a.first} ${a.last}`.trim() }));

      const payload = {
        literature: {
          title,
          authors: formattedAuthors,
          year,
          publisher,
          url,
        },
        format: "apa",
      };

      const res = await formatReference(payload);
      setPreview(
        res.formatted_reference || res.formatted || "[No formatted reference]"
      );
    } catch (err) {
      console.error("Preview failed:", err);
      setPreview("[Formatting error]");
    }
  };

  return (
    <>
      {/* Button to open dialog - Notion style */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add reference
      </button>

      {/* Main modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal body */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 z-10 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Add Reference
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Type selector - Notion style pills */}
          <div className="flex gap-2 mb-6">
            {["Website", "Book", "Journal", "Video"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  type === t
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Metadata form */}
          <div className="space-y-5">
            {/* DOI or URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOI or URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="10.xxxx/xxxxx or https://arxiv.org/abs/xxxx"
                  value={url}
                  onChange={(e) => {
                    const input = e.target.value.trim();
                    setUrl(input);

                    // Auto-fetch if pattern matches DOI or arXiv
                    const doiMatch = input.match(
                      /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i
                    );
                    const arxivMatch = input.match(
                      /arxiv\.org\/abs\/([0-9]+\.[0-9]+)(v[0-9]+)?/i
                    );

                    if (doiMatch || arxivMatch) {
                      handleFetchMetadata();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />

                <button
                  onClick={handleFetchMetadata}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <Search size={16} /> {loading ? "Loading..." : "Fetch"}
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter title"
              />
            </div>

            {/* Authors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authors
              </label>
              <div className="space-y-2">
                {authors.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={a.first}
                      onChange={(e) =>
                        handleChangeAuthor(i, "first", e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={a.last}
                      onChange={(e) =>
                        handleChangeAuthor(i, "last", e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddAuthor}
                className="text-gray-600 text-sm mt-2 hover:text-gray-900 transition-colors"
              >
                + Add another author
              </button>
            </div>

            {/* Year + Publisher */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter publisher"
                />
              </div>
            </div>

            {/* PDF drag & drop */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">
                Drag and drop a PDF here or click to upload
              </p>
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={handleDrop}
              />
            </div>
          </div>

          {/* Live preview */}
          {preview && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Preview</p>
              <p className="text-sm text-gray-700">{preview}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handlePreview}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Save reference
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
