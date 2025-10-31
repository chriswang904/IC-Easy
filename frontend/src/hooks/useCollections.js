// src/hooks/useCollections.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useCollections = () => {
  const [collections, setCollections] = useState(() => {
    const stored = localStorage.getItem("collections");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);

  const saveToLocal = (data) => {
    localStorage.setItem("collections", JSON.stringify(data));
    setCollections(data);
    window.dispatchEvent(new Event("collections-updated"));
  };

  const fetchCollections = () => {
    const stored = localStorage.getItem("collections");
    if (stored) {
      setCollections(JSON.parse(stored));
    }
  };

  const checkCollected = async (paperId) => {
    const stored = localStorage.getItem("collections");
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.some((item) => item.paper_id === paperId || item.id === paperId);
  };

  const addToCollection = (paper, subjectId, groupId) => {
    if (!subjectId || !groupId) {
      toast.warn("Please select a subject and group first.");
      return;
    }

    const paperId =
      paper.doi ||
      paper.id ||
      `${paper.source}-${paper.title.substring(0, 50).replace(/\s/g, "-")}`;

    const existsInSameGroup = collections.some(
      (c) => 
        (c.paper_id === paperId || c.id === paperId) && 
        Number(c.group_id) === Number(groupId)
    );
    
    if (existsInSameGroup) {
      toast.info("This paper is already in this collection.");
      return;
    }

    const existsInOtherGroup = collections.find(
      (c) => 
        (c.paper_id === paperId || c.id === paperId) && 
        Number(c.group_id) !== Number(groupId)
    );
    
    if (existsInOtherGroup) {
      const subjects = JSON.parse(localStorage.getItem("subjects"));
      const otherGroupName = subjects
        .flatMap(s => s.items)
        .find(g => g.id === existsInOtherGroup.group_id)?.name;
      
      if (!window.confirm(`This paper already exists in "${otherGroupName}". Add to this collection too?`)) {
        return;
      }
    }

    const newItem = {
      id: Date.now(),
      paper_id: paperId,
      title: paper.title,
      url: paper.url,
      authors: paper.authors || [],
      abstract: paper.abstract || "",
      source: paper.source,
      date: new Date().toISOString(),
      citation_count: paper.citationCount || 0,
      subject_id: Number(subjectId),
      group_id: Number(groupId),
    };

    const updated = [...collections, newItem];
    saveToLocal(updated);
    toast.success(`Added "${paper.title}" to your collection.`);
  };

  const removeFromCollection = (idOrPaperId) => {
    const updated = collections.filter(
      (c) => c.id !== idOrPaperId && c.paper_id !== idOrPaperId
    );
    saveToLocal(updated);
  };

  const batchDelete = (ids) => {
    const updated = collections.filter((c) => !ids.includes(c.id));
    saveToLocal(updated);
    toast.info(`Deleted ${ids.length} papers.`);
  };

  useEffect(() => {
    const handleStorageChange = () => fetchCollections();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    collections,
    loading,
    fetchCollections,
    addToCollection,
    removeFromCollection,
    batchDelete,
    checkCollected, 
  };
};