import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Star } from "lucide-react";
import MenuSection from "../components/collections/MenuSection";
import CollectionCard from "../components/collections/CollectionCard";
import { useCollections } from "../hooks/useCollections";
import { toast } from "react-toastify";

function CollectionsPage() {
  // === Active filters ===
  const [activeSubjectId, setActiveSubjectId] = useState("all");
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeName, setActiveName] = useState("All Files");

  // === Local state ===
  const [subjects, setSubjects] = useState(() => {
    const stored = localStorage.getItem("subjects");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // === Hooks ===
  const {
    collections,
    loading,
    removeFromCollection,
    fetchCollections,
    batchDelete,
  } = useCollections();

  // === Fetch collections on mount ===
  useEffect(() => {
    fetchCollections();
  }, []);

  // === Sync subjects from localStorage ===
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("subjects");
      if (stored) setSubjects(JSON.parse(stored));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("subjectsUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("subjectsUpdated", handleStorageChange);
    };
  }, []);

  // === Handle subject & group changes ===
  const handleSubjectChange = (subjectId, subjectName) => {
    setActiveSubjectId(subjectId);
    setActiveGroupId(null);
    setActiveName(subjectName);
  };

  const handleGroupChange = (groupId, groupName) => {
    setActiveGroupId(groupId);
    setActiveName(groupName);
  };

  // === Transform collections for UI ===
  const allItems = useMemo(
    () =>
      collections.map((paper) => ({
        id: paper.id,
        collectionId: paper.id,
        paperId: paper.paper_id,
        title: paper.title,
        type: "papers",
        avatar: paper.title[0]?.toUpperCase() || "P",
        date: paper.date
          ? new Date(paper.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Unknown Date",
        description: paper.abstract || "No abstract available",
        subject_id: paper.subject_id || null,
        group_id: paper.group_id || null,
        url: paper.url,
        source: paper.source,
        authors: paper.authors || [],
        citationCount: paper.citation_count || 0,
      })),
    [collections]
  );

  // === Filter items ===
  const filteredItems = useMemo(() => {
    console.log("=== Filtering START ===");
    console.log("activeSubjectId:", activeSubjectId);
    console.log("activeGroupId:", activeGroupId);
    console.log("allItems total:", allItems.length);

    if (activeGroupId) {
      console.log("Filtering by group_id:", activeGroupId);
      const filtered = allItems.filter((item) => {
        const match = Number(item.group_id) === Number(activeGroupId);
        console.log(
          `  ${item.title.substring(0, 25)} | group: ${
            item.group_id
          } | match: ${match}`
        );
        return match;
      });
      console.log("=== Final filtered:", filtered.length);
      return filtered;
    }

    if (activeSubjectId === "all") {
      console.log("Showing all collections");
      return allItems;
    }

    console.log("Filtering by subject_id:", activeSubjectId);
    return allItems.filter(
      (item) => Number(item.subject_id) === Number(activeSubjectId)
    );
  }, [activeSubjectId, activeGroupId, allItems]);

  // === Select / Delete logic ===
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} papers?`)) return;
    try {
      await batchDelete(selectedIds);
      setSelectedIds([]);
      setIsSelecting(false);
    } catch {
      toast.error("Failed to delete papers");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.collectionId));
    }
  };

  const handleDelete = async (collectionId, e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this paper from your collection?")) return;
    try {
      await removeFromCollection(collectionId);
      toast.info("Paper removed");
    } catch {
      toast.error("Failed to remove paper");
    }
  };

  const handlePaperClick = (item) => {
    if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
  };

  // === Render ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="flex bg-white rounded-3xl shadow-xl w-full max-w-7xl mx-auto min-h-[calc(100vh-3rem)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200">
          <MenuSection
            activeTopicId={activeSubjectId}
            activeGroupId={activeGroupId}
            onTopicChange={handleSubjectChange}
            onGroupChange={handleGroupChange}
          />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{activeName}</h1>
              <div className="flex items-center gap-2">
                {!isSelecting ? (
                  <>
                    <button
                      onClick={() => setIsSelecting(true)}
                      className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      Select
                    </button>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-600 text-sm">
                      {filteredItems.length} paper
                      {filteredItems.length !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 text-sm"
                    >
                      {selectedIds.length === filteredItems.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      disabled={selectedIds.length === 0}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg disabled:bg-gray-300"
                    >
                      Delete ({selectedIds.length})
                    </button>
                    <button
                      onClick={() => {
                        setIsSelecting(false);
                        setSelectedIds([]);
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-8 py-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {activeSubjectId === "all"
                      ? "No saved papers yet"
                      : `No papers in "${activeName}"`}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Click the star icon on any paper to save it here
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredItems.map((item) => (
                    <CollectionCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onClick={handlePaperClick}
                      isSelecting={isSelecting}
                      isSelected={selectedIds.includes(item.collectionId)}
                      onSelect={(id) =>
                        setSelectedIds((prev) =>
                          prev.includes(id)
                            ? prev.filter((i) => i !== id)
                            : [...prev, id]
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CollectionsPage;
