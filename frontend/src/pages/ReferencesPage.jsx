// src/pages/ReferencesPage.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ReferenceCard from "../components/references/ReferenceCard";
import ReferenceToolbar from "../components/references/ReferenceToolbar";
import { useReferences } from "../hooks/useReferences";

export default function ReferencesPage() {
  const { references, addReference, removeReference, format, setFormat, loadFromCollections } = useReferences();

  useEffect(() => {
    loadFromCollections();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My References</h1>
        </header>

        <ReferenceToolbar
          format={format}
          setFormat={setFormat}
          onAdd={addReference}
          onCopyAll={() => toast.success("Copied all references")}
        />

        <ul className="space-y-3 mt-6">
          {references.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No references yet</p>
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
        </ul>
      </div>
    </div>
  );
}
