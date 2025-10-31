// src/hooks/useReferences.js
import { useState } from "react";

export function useReferences() {
  const [references, setReferences] = useState([]);
  const [format, setFormat] = useState("apa");

  const loadFromCollections = () => {
    const collections = JSON.parse(localStorage.getItem("collections") || "[]");
    setReferences(collections);
  };

  const addReference = () => {
    const title = prompt("Enter title:");
    if (!title) return;
    const newRef = {
      id: Date.now(),
      title,
      authors: [],
      year: new Date().getFullYear(),
    };
    setReferences((prev) => [...prev, newRef]);
  };

  const removeReference = (id) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  return { references, format, setFormat, addReference, removeReference, loadFromCollections };
}
