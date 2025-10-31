// src/pages/ReferencesPage.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ReferenceCard from "../components/references/ReferenceCard";
import ReferenceToolbar from "../components/references/ReferenceToolbar";
import { useReferences } from "../hooks/useReferences";

export default function ReferencesPage() {
  const {
    references,
    addReference,
    removeReference,
    format,
    setFormat,
    loadFromCollections,
  } = useReferences();

  useEffect(() => {
    loadFromCollections();
  }, []);

  useEffect(() => {
    console.log("📚 Current references state:", references);
  }, [references]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[90%] max-w-6xl mx-auto min-h-[calc(100vh-3rem)]">
        {/* Main Content */}
        <div className="px-8 py-8">
          {/* Page Title Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              My References
            </h2>
            <p className="text-gray-500 text-sm">
              {references.length}{" "}
              {references.length === 1 ? "reference" : "references"}
            </p>
          </div>

          {/* Toolbar */}
          <div className="mb-6">
            <ReferenceToolbar
              format={format}
              setFormat={setFormat}
              onAdd={addReference}
              onCopyAll={() => toast.success("Copied all references")}
            />
          </div>

          {/* References List */}
          <div className="space-y-2">
            {references.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-1">
                  No references yet
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Add your first reference to get started
                </p>
                {/* <button
                  onClick={addReference}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Reference
                </button> */}
              </div>
            ) : (
              references.map((ref, idx) => (
                <ReferenceCard
                  key={idx}
                  refData={ref}
                  format={format}
                  onDelete={() => removeReference(ref.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
