import React from "react";
import { BookOpen, Trash2 } from "lucide-react";

function CollectionCard({
  item,
  onDelete,
  onClick,
  isSelecting,
  isSelected,
  onSelect,
}) {
  const getSourceBadge = (source) => {
    const badges = {
      arxiv: "bg-orange-100 text-orange-700",
      crossref: "bg-blue-100 text-blue-700",
      openalex: "bg-green-100 text-green-700",
    };
    return badges[source] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type) => {
    return <BookOpen size={16} />;
  };

  const handleCardClick = () => {
    if (isSelecting) {
      // In selecting mode, toggle selection
      onSelect(item.collectionId);
    } else {
      // Normal mode, open the paper
      onClick(item);
    }
  };

  return (
    <li
      onClick={handleCardClick}
      className={`flex items-start gap-4 p-4 bg-white rounded-2xl hover:bg-purple-50 transition cursor-pointer border group ${
        isSelected
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200 hover:border-purple-200"
      }`}
    >
      {/* Checkbox for selecting mode */}
      {isSelecting && (
        <div className="flex items-center justify-center flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.collectionId)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Avatar */}
      <div className="w-10 h-10 bg-[#eaddff] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-[#4f378a] font-medium text-base">
          {item.avatar}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {item.authors && item.authors.length > 0 && (
            <span>
              {item.authors
                .slice(0, 2)
                .map((a) => a.name)
                .join(", ")}
              {item.authors.length > 2 && ` +${item.authors.length - 2}`}
            </span>
          )}
          {item.citationCount > 0 && (
            <>
              <span>•</span>
              <span>{item.citationCount} citations</span>
            </>
          )}
          <span>•</span>
          <span>{item.date}</span>
          {item.collectedAt && (
            <>
              <span>•</span>
              <span>
                Added on {new Date(item.collectedAt).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side badges and actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Source badge */}
        {item.source && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceBadge(
              item.source
            )}`}
          >
            {item.source}
          </span>
        )}

        {/* Type badge */}
        <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
          {getTypeIcon(item.type)}
          <span className="text-xs font-medium capitalize">{item.type}</span>
        </div>

        {/* Delete button - only show when NOT in selecting mode */}
        {!isSelecting && (
          <button
            onClick={(e) => onDelete(item.collectionId, e)}
            className="p-2 hover:bg-red-100 rounded-full transition opacity-0 group-hover:opacity-100"
            title="Remove from collection"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>
    </li>
  );
}

export default CollectionCard;
