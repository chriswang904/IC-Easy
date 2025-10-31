// src/components/paper/PaperCard.jsx
import React, { useState, useEffect } from "react";
import { Star, AlertCircle } from "lucide-react";
import { useCollections } from "../../hooks/useCollections";
import { toast } from "react-toastify";
import SelectCollectionDialog from "../collections/SelectCollectionDialog";

export default function PaperCard({ paper, onClick }) {
  const { addToCollection, removeFromCollection, checkCollected, collections } =
    useCollections();

  const [isCollected, setIsCollected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Paper unique ID
  const paperId =
    paper.doi ||
    paper.id ||
    `${paper.source}-${paper.title.substring(0, 50).replace(/\s/g, "-")}`;

  // Check if collected
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const collected = await checkCollected(paperId);
        setIsCollected(collected);
      } catch (error) {
        console.error("Failed to check collection status:", error);
      }
    };
    checkStatus();
  }, [paperId, collections]);

  // Listen for global collection updates
  useEffect(() => {
    const handleUpdate = async () => {
      const collected = await checkCollected(paperId);
      setIsCollected(collected);
    };
    window.addEventListener("collections-updated", handleUpdate);
    return () => window.removeEventListener("collections-updated", handleUpdate);
  }, [paperId]);

  // Handle star click
  const handleStarClick = async (e) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("Please login to save papers to your collection");
      return;
    }

    setIsLoading(true);
    try {
      if (isCollected) {
        await removeFromCollection(paperId);
        // toast.info("Removed from collection");
        setIsCollected(false);
      }
      else {
        // Show subject/group picker
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Toggle collection failed:", error);
      toast.error("Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <article
        onClick={() => onClick(paper)}
        className="flex items-start gap-4 p-4 hover:bg-purple-50 rounded-2xl transition group cursor-pointer border border-transparent hover:border-purple-200"
      >
        {/* image */}
        <div className="w-20 h-20 flex-shrink-0">
          <img
            src={paper.image}
            alt={paper.title}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        {/* details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition flex-1">
              {paper.title}
            </h2>

            {/* Source */}
            {paper.source && (
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                  paper.source === "arxiv"
                    ? "bg-orange-100 text-orange-700"
                    : paper.source === "crossref"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {paper.source === "arxiv"
                  ? "arXiv"
                  : paper.source === "crossref"
                  ? "CrossRef"
                  : "OpenAlex"}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-purple-600">{paper.category}</span>{" "}
            • {paper.metadata}
          </p>

          {paper.authors && paper.authors.length > 0 && (
            <p className="text-xs text-gray-500 mb-1">
              {paper.authors.slice(0, 3).join(", ")}
              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-2">
            {paper.description}
          </p>

          {paper.source === "arxiv" && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span className="italic">Preprint - citation data not available</span>
            </p>
          )}
        </div>

        {/* star */}
        <button
          onClick={handleStarClick}
          disabled={isLoading}
          className={`p-2 hover:bg-purple-100 rounded-full transition ${
            isCollected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
          title={isCollected ? "Remove from collection" : "Add to collection"}
        >
          <Star
            className={`w-5 h-5 transition ${
              isCollected
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400 hover:text-yellow-400"
            } ${isLoading ? "animate-pulse" : ""}`}
          />
        </button>
      </article>

      {/* New Subject/Group selection dialog */}
      <SelectCollectionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={async (subjectId, groupId) => {
          try {
            await addToCollection(paper, subjectId, groupId);
            // toast.success("Added to collection");
            setIsCollected(true);
            setShowDialog(false);
          } catch (error) {
            console.error("Add to collection failed:", error);
            toast.error("Failed to add paper");
          }
        }}
      />
    </>
  );
}
