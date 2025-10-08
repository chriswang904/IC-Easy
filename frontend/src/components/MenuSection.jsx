import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FileText,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";

function MenuSection({ activeTopicId: externalActiveTopicId, onTopicChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalActiveTopicId, setInternalActiveTopicId] = useState(null);
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "Work",
      expanded: true,
      items: [
        { id: 101, name: "Meeting Notes", type: "topic" },
        {
          id: 102,
          name: "Projects",
          type: "group",
          items: [{ id: 201, name: "Q1 Planning", type: "topic" }],
        },
      ],
    },
    {
      id: 2,
      name: "Personal",
      expanded: false,
      items: [{ id: 103, name: "Journal", type: "topic" }],
    },
  ]);
  const [showAddMenu, setShowAddMenu] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editValue, setEditValue] = useState("");

  const addMenuRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Close menus when mouse leaves
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (showAddMenu && addMenuRef.current) {
        const rect = addMenuRef.current.getBoundingClientRect();
        const buffer = 50; // pixels of buffer zone
        if (
          e.clientX < rect.left - buffer ||
          e.clientX > rect.right + buffer ||
          e.clientY < rect.top - buffer ||
          e.clientY > rect.bottom + buffer
        ) {
          setShowAddMenu(null);
        }
      }

      if (showContextMenu && contextMenuRef.current) {
        const rect = contextMenuRef.current.getBoundingClientRect();
        const buffer = 50;
        if (
          e.clientX < rect.left - buffer ||
          e.clientX > rect.right + buffer ||
          e.clientY < rect.top - buffer ||
          e.clientY > rect.bottom + buffer
        ) {
          setShowContextMenu(null);
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [showAddMenu, showContextMenu]);

  const handleTopicClick = (topicId) => {
    // Update internal state to keep topic highlighted
    setInternalActiveTopicId(topicId);

    // Also call the external callback if provided
    if (onTopicChange) {
      onTopicChange(topicId);
    }
  };

  // Use external activeTopicId if provided, otherwise use internal
  const activeTopicId =
    externalActiveTopicId !== undefined
      ? externalActiveTopicId
      : internalActiveTopicId;

  const toggleSubject = (subjectId) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === subjectId
          ? { ...subject, expanded: !subject.expanded }
          : subject
      )
    );
  };

  const addNewSubject = () => {
    const newSubjectId = Date.now();
    const newSubject = {
      id: newSubjectId,
      name: `Subject ${subjects.length + 1}`,
      expanded: true,
      items: [],
    };
    setSubjects([...subjects, newSubject]);
    // Clear search when adding new subject so it's visible
    setSearchQuery("");

    // Auto-start editing the new subject after state update
    setTimeout(() => {
      setEditingSubject(newSubjectId);
      setEditValue(`Subject ${subjects.length + 1}`);
    }, 0);
  };

  const addItemToSubject = (subjectId, type) => {
    const newItemId = Date.now();
    const newItemName = type === "group" ? "New Group" : "New Topic";

    setSubjects(
      subjects.map((subject) => {
        if (subject.id === subjectId) {
          const newItem = {
            id: newItemId,
            name: newItemName,
            type: type,
            items: type === "group" ? [] : undefined,
          };
          return {
            ...subject,
            expanded: true, // Auto-expand the subject
            items: [...subject.items, newItem],
          };
        }
        return subject;
      })
    );
    setShowAddMenu(null);
    // Clear search when adding new item so it's visible
    setSearchQuery("");

    // Auto-start editing the new item after state update
    setTimeout(() => {
      setEditingItem(newItemId);
      setEditValue(newItemName);
    }, 0);
  };

  const deleteSubject = (subjectId) => {
    setSubjects(subjects.filter((subject) => subject.id !== subjectId));
    setShowContextMenu(null);
  };

  const deleteItem = (subjectId, itemId) => {
    const deleteItemRecursive = (items) => {
      return items.filter((item) => {
        if (item.id === itemId) return false;
        if (item.items) {
          item.items = deleteItemRecursive(item.items);
        }
        return true;
      });
    };

    setSubjects(
      subjects.map((subject) => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            items: deleteItemRecursive(subject.items),
          };
        }
        return subject;
      })
    );
    setShowContextMenu(null);
  };

  const startEditingSubject = (subject) => {
    setEditingSubject(subject.id);
    setEditValue(subject.name);
    setShowContextMenu(null);
    // Auto-expand the subject when editing
    setSubjects(
      subjects.map((s) => (s.id === subject.id ? { ...s, expanded: true } : s))
    );
  };

  const startEditingItem = (item, subjectId) => {
    setEditingItem(item.id);
    setEditValue(item.name);
    setShowContextMenu(null);
    // Auto-expand the subject when editing an item
    setSubjects(
      subjects.map((s) => (s.id === subjectId ? { ...s, expanded: true } : s))
    );
  };

  const saveSubjectEdit = (subjectId) => {
    if (editValue.trim()) {
      setSubjects(
        subjects.map((subject) =>
          subject.id === subjectId
            ? { ...subject, name: editValue.trim() }
            : subject
        )
      );
    }
    setEditingSubject(null);
    setEditValue("");
  };

  const saveItemEdit = (subjectId, itemId) => {
    if (editValue.trim()) {
      const updateItemRecursive = (items) => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, name: editValue.trim() };
          }
          if (item.items) {
            return { ...item, items: updateItemRecursive(item.items) };
          }
          return item;
        });
      };

      setSubjects(
        subjects.map((subject) => {
          if (subject.id === subjectId) {
            return {
              ...subject,
              items: updateItemRecursive(subject.items),
            };
          }
          return subject;
        })
      );
    }
    setEditingItem(null);
    setEditValue("");
  };

  // Filter subjects and topics based on search query
  const filterSubjects = (subjectsToFilter, query) => {
    if (!query.trim()) return subjectsToFilter;

    const searchLower = query.toLowerCase();

    const filterItems = (items) => {
      return items.reduce((acc, item) => {
        const nameMatches = item.name.toLowerCase().includes(searchLower);

        if (item.type === "topic") {
          if (nameMatches) acc.push(item);
        } else if (item.type === "group") {
          const filteredChildren = item.items ? filterItems(item.items) : [];
          if (nameMatches || filteredChildren.length > 0) {
            acc.push({
              ...item,
              items: filteredChildren,
            });
          }
        }
        return acc;
      }, []);
    };

    return subjectsToFilter.reduce((acc, subject) => {
      const subjectMatches = subject.name.toLowerCase().includes(searchLower);
      const filteredItems = filterItems(subject.items);

      if (subjectMatches || filteredItems.length > 0) {
        acc.push({
          ...subject,
          items: filteredItems,
          expanded: query.trim() ? true : subject.expanded, // Auto-expand when searching
        });
      }
      return acc;
    }, []);
  };

  const filteredSubjects = filterSubjects(subjects, searchQuery);

  const SubjectItem = ({ item, subjectId, level = 0 }) => {
    const [expanded, setExpanded] = useState(false);

    // Update expanded state when search query changes
    useEffect(() => {
      if (searchQuery.trim()) {
        setExpanded(true);
      }
    }, [searchQuery]);
    const paddingLeft = `${(level + 1) * 16}px`;
    const isActive = item.type === "topic" && item.id === activeTopicId;
    const isEditing = editingItem === item.id;

    if (item.type === "topic") {
      return (
        <div className="relative group">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveItemEdit(subjectId, item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveItemEdit(subjectId, item.id);
                if (e.key === "Escape") {
                  setEditingItem(null);
                  setEditValue("");
                }
              }}
              className="w-full px-3 py-2 text-sm border border-[#e8def8] rounded focus:outline-none focus:ring-2 focus:ring-[#e8def8]"
              style={{ paddingLeft }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => handleTopicClick(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition ${
                isActive
                  ? "bg-purple-200 text-[#4a4459] font-medium"
                  : "text-gray-700 hover:bg-[#e8def8]/50"
              }`}
              style={{ paddingLeft }}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-left flex-1">{item.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(
                    showContextMenu === item.id ? null : item.id
                  );
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded transition"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </button>
          )}

          {showContextMenu === item.id && (
            <div
              ref={contextMenuRef}
              className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-1 w-32 border border-gray-200 z-50"
            >
              <button
                onClick={() => startEditingItem(item, subjectId)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={() => deleteItem(subjectId, item.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="relative group">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveItemEdit(subjectId, item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveItemEdit(subjectId, item.id);
                if (e.key === "Escape") {
                  setEditingItem(null);
                  setEditValue("");
                }
              }}
              className="w-full px-3 py-2 text-sm border border-[#e8def8] rounded focus:outline-none focus:ring-2 focus:ring-[#e8def8]"
              style={{ paddingLeft }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#e8def8]/50 rounded transition"
              style={{ paddingLeft }}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
              <FolderPlus className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate text-left flex-1">{item.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(
                    showContextMenu === item.id ? null : item.id
                  );
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded transition"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </button>
          )}

          {showContextMenu === item.id && (
            <div
              ref={contextMenuRef}
              className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-1 w-32 border border-gray-200 z-50"
            >
              <button
                onClick={() => startEditingItem(item, subjectId)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={() => deleteItem(subjectId, item.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {expanded && item.items && item.items.length > 0 && (
          <div className="ml-2">
            {item.items.map((subItem) => (
              <SubjectItem
                key={subItem.id}
                item={subItem}
                subjectId={subjectId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className="flex flex-col w-full h-full bg-[#ffffff]"
      role="navigation"
      aria-label="Main menu"
    >
      {/* Search Bar - Sticky positioning keeps it at top while scrolling */}
      <div className="sticky top-0 z-10 px-8 py-12 bg-[#ffffff]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8def8] focus:border-transparent"
            aria-label="Search topics"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Subjects Section - Takes full remaining space */}
      <div className="flex-1 flex flex-col px-8 pb-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#4a4459] uppercase tracking-wide">
            Subjects
          </h3>
          <button
            onClick={addNewSubject}
            className="p-1.5 hover:bg-[#e8def8] rounded-lg transition"
            aria-label="Add new subject"
          >
            <Plus className="w-4 h-4 text-[#4a4459]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <div key={subject.id} className="mb-2">
                <div className="flex items-center justify-between group">
                  {editingSubject === subject.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveSubjectEdit(subject.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveSubjectEdit(subject.id);
                        if (e.key === "Escape") {
                          setEditingSubject(null);
                          setEditValue("");
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium border border-[#e8def8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8def8]"
                      autoFocus
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => toggleSubject(subject.id)}
                        className="flex-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1d1b20] hover:bg-[#e8def8]/70 rounded-lg transition"
                      >
                        {subject.expanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate text-left">
                          {subject.name}
                        </span>
                      </button>

                      <div className="relative flex items-center gap-1">
                        <button
                          onClick={() =>
                            setShowAddMenu(
                              showAddMenu === subject.id ? null : subject.id
                            )
                          }
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[#e8def8] rounded-lg transition"
                          aria-label="Add item to subject"
                        >
                          <Plus className="w-4 h-4 text-[#4a4459]" />
                        </button>

                        <button
                          onClick={() =>
                            setShowContextMenu(
                              showContextMenu === `subject-${subject.id}`
                                ? null
                                : `subject-${subject.id}`
                            )
                          }
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[#e8def8] rounded-lg transition"
                          aria-label="Subject options"
                        >
                          <MoreVertical className="w-4 h-4 text-[#4a4459]" />
                        </button>

                        {showAddMenu === subject.id && (
                          <div
                            ref={addMenuRef}
                            className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-1 w-32 border border-gray-200 z-50"
                          >
                            <button
                              onClick={() =>
                                addItemToSubject(subject.id, "group")
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <FolderPlus className="w-4 h-4" />
                              Group
                            </button>
                            <button
                              onClick={() =>
                                addItemToSubject(subject.id, "topic")
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <FileText className="w-4 h-4" />
                              Topic
                            </button>
                          </div>
                        )}

                        {showContextMenu === `subject-${subject.id}` && (
                          <div
                            ref={contextMenuRef}
                            className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-1 w-32 border border-gray-200 z-50"
                          >
                            <button
                              onClick={() => startEditingSubject(subject)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                              Rename
                            </button>
                            <button
                              onClick={() => deleteSubject(subject.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {subject.expanded &&
                  subject.items &&
                  subject.items.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {subject.items.map((item) => (
                        <SubjectItem
                          key={item.id}
                          item={item}
                          subjectId={subject.id}
                        />
                      ))}
                    </div>
                  )}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
              No topics found
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default MenuSection;
