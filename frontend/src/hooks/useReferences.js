// src/hooks/useReferences.js
import { useState } from "react";

export function useReferences() {
  const [references, setReferences] = useState([]);
  const [format, setFormat] = useState("apa");

  const loadFromCollections = () => {
    const collections = JSON.parse(localStorage.getItem("collections") || "[]");
    setReferences(collections);
  };

  const addReference = (newRef) => {
    // ACCEPT the parameter!
    if (!newRef) return;
    setReferences((prev) => [...prev, newRef]);
  };

  const removeReference = (id) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    references,
    format,
    setFormat,
    addReference,
    removeReference,
    loadFromCollections,
  };
}
