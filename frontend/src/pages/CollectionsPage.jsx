import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  BookOpen,
  PenSquare,
  Plus,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

// MenuSection component - your original with rename/delete functionality
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
        const buffer = 50;
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

  const handleTopicClick = (topicId, topicName) => {
    setInternalActiveTopicId(topicId);
    if (onTopicChange) {
      onTopicChange(topicId, topicName);
    }
  };

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
    setSearchQuery("");

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
            expanded: true,
            items: [...subject.items, newItem],
          };
        }
        return subject;
      })
    );
    setShowAddMenu(null);
    setSearchQuery("");

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
    setSubjects(
      subjects.map((s) => (s.id === subject.id ? { ...s, expanded: true } : s))
    );
  };

  const startEditingItem = (item, subjectId) => {
    setEditingItem(item.id);
    setEditValue(item.name);
    setShowContextMenu(null);
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
          expanded: query.trim() ? true : subject.expanded,
        });
      }
      return acc;
    }, []);
  };

  const filteredSubjects = filterSubjects(subjects, searchQuery);

  const SubjectItem = ({ item, subjectId, level = 0 }) => {
    const [expanded, setExpanded] = useState(false);

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
              onClick={() => handleTopicClick(item.id, item.name)}
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
      {/* Search Bar */}
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

      {/* Subjects Section */}
      <div className="flex-1 flex flex-col px-8 pb-4 overflow-hidden">
        {/* Show All Button */}
        <div className="mb-4">
          <button
            onClick={() => handleTopicClick(null, "All Files")}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${
              activeTopicId === null
                ? "bg-purple-200 text-[#4a4459] font-medium"
                : "text-gray-700 hover:bg-[#e8def8]/50"
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-left flex-1">Show All</span>
          </button>
        </div>

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

// Main CollectionsPage component
function CollectionsPage() {
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [activeTopicName, setActiveTopicName] = useState("All Files");

  // Sample data with topicId associations
  const allItems = [
    {
      id: 1,
      title: "Attention Is All You Need",
      type: "papers",
      avatar: "A",
      date: "2 days ago",
      description:
        "Transformer architecture paper introducing self-attention mechanisms",
      topicId: 101,
    },
    {
      id: 2,
      title: "Deep Learning Fundamentals",
      type: "notes",
      avatar: "D",
      date: "3 days ago",
      description: "Key concepts in neural networks and backpropagation",
      topicId: 101,
    },
    {
      id: 3,
      title: "The Future of AI Research",
      type: "essays",
      avatar: "F",
      date: "1 week ago",
      description: "Analysis of emerging trends in artificial intelligence",
      topicId: 201,
    },
    {
      id: 4,
      title: "BERT: Pre-training Language Models",
      type: "papers",
      avatar: "B",
      date: "1 week ago",
      description: "Bidirectional encoder representations from transformers",
      topicId: 201,
    },
    {
      id: 5,
      title: "Machine Learning Study Notes",
      type: "notes",
      avatar: "M",
      date: "2 weeks ago",
      description: "Supervised and unsupervised learning techniques",
      topicId: 103,
    },
    {
      id: 6,
      title: "Ethics in AI Development",
      type: "essays",
      avatar: "E",
      date: "2 weeks ago",
      description: "Exploring ethical considerations in modern AI systems",
      topicId: 103,
    },
  ];

  const filteredItems =
    activeTopicId === null
      ? allItems
      : allItems.filter((item) => item.topicId === activeTopicId);

  const getTypeIcon = (type) => {
    switch (type) {
      case "notes":
        return <FileText size={16} />;
      case "essays":
        return <PenSquare size={16} />;
      case "papers":
        return <BookOpen size={16} />;
      default:
        return null;
    }
  };

  const handleTopicChange = (topicId, topicName) => {
    setActiveTopicId(topicId);
    setActiveTopicName(topicName);
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex justify-center items-start p-6">
          <div className="flex bg-white rounded-t-3xl shadow-xl w-[90%] max-w-6xl min-h-screen overflow-hidden">
            <div className="w-64 flex-shrink-0">
              <MenuSection
                activeTopicId={activeTopicId}
                onTopicChange={handleTopicChange}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <header className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-3xl px-4 py-8 font-bold text-gray-900 mb-0">
                  {activeTopicName}
                </h1>
              </header>

              <main className="flex-1 px-8 py-6 overflow-auto">
                <ul className="space-y-3">
                  {filteredItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-purple-50 transition cursor-pointer border border-gray-200 hover:border-purple-200"
                    >
                      <div className="w-10 h-10 bg-[#eaddff] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#4f378a] font-medium text-base">
                          {item.avatar}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full flex-shrink-0">
                        {getTypeIcon(item.type)}
                        <span className="text-xs font-medium capitalize">
                          {item.type}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No items found for "{activeTopicName}"
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CollectionsPage;
