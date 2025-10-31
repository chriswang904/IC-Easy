// src/components/collections/MenuSection.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Folder,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";

function MenuSection({
  activeTopicId,
  activeGroupId,
  onTopicChange,
  onGroupChange,
}) {
  const [subjects, setSubjects] = useState(() => {
    const stored = localStorage.getItem("subjects");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 1,
        name: "Default Subject",
        expanded: true,
        items: [{ id: 101, name: "My Papers", type: "group", items: [] }],
      },
    ];
  });

  const [editingSubject, setEditingSubject] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showContextMenu, setShowContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setShowContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSubject = (subjectId) => {
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  const addSubject = () => {
    const newId = Date.now();
    const newSubject = { id: newId, name: "New Subject", expanded: true, items: [] };
    setSubjects([...subjects, newSubject]);
    setEditingSubject(newId);
    setEditValue("New Subject");
  };

  const addGroupToSubject = (subjectId) => {
    const newId = Date.now();
    const newGroup = { id: newId, name: "New Group", type: "group", items: [] };
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId ? { ...s, expanded: true, items: [...s.items, newGroup] } : s
      )
    );
    setEditingItem(newId);
    setEditValue("New Group");
  };

  const handleGroupClick = (groupId, groupName) => {
    if (onGroupChange) onGroupChange(groupId, groupName);
  };

  const handleDeleteGroup = (subjectId, groupId) => {
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId
          ? { ...s, items: s.items.filter((g) => g.id !== groupId) }
          : s
      )
    );
  };

  const handleDeleteSubject = (subjectId) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId));
  };

  const saveEdit = (subjectId, groupId) => {
    if (!editValue.trim()) return;
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          if (groupId) {
            return {
              ...s,
              items: s.items.map((g) =>
                g.id === groupId ? { ...g, name: editValue.trim() } : g
              ),
            };
          } else {
            return { ...s, name: editValue.trim() };
          }
        }
        return s;
      })
    );
    setEditingSubject(null);
    setEditingItem(null);
    setEditValue("");
  };

  return (
    <nav className="flex flex-col w-full h-full bg-white" role="navigation" aria-label="Collections">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-[#4a4459] uppercase">Subjects</h3>
        <button onClick={addSubject} className="p-1.5 hover:bg-purple-100 rounded-lg">
          <Plus className="w-4 h-4 text-[#4a4459]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        <li
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${
                activeTopicId === "all" ? "bg-purple-100 text-purple-700 font-medium" : "hover:bg-gray-100"
            }`}
            onClick={() => onTopicChange("all", "All Files")}
        >
            📁 Show All Collections
        </li>
        {subjects.map((subject) => (
          <div key={subject.id} className="mb-2">
            <div className="flex items-center justify-between group">
              {editingSubject === subject.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(subject.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(subject.id);
                    if (e.key === "Escape") setEditingSubject(null);
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="flex-1 flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-purple-50 rounded-lg"
                >
                  {subject.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>{subject.name}</span>
                </button>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => addGroupToSubject(subject.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-purple-100 rounded transition"
                  title="Add Group"
                >
                  <Folder className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {subject.expanded && (
              <div className="ml-4 space-y-1 mt-1">
                {subject.items.map((group) => (
                  <div key={group.id} className="flex items-center justify-between group">
                    {editingItem === group.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(subject.id, group.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(subject.id, group.id);
                          if (e.key === "Escape") setEditingItem(null);
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => handleGroupClick(group.id, group.name)}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-purple-50 transition ${
                          activeGroupId === group.id
                            ? "bg-purple-100 text-purple-700 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <Folder className="w-4 h-4 text-gray-500" />
                        <span>{group.name}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGroup(subject.id, group.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition"
                      title="Delete Group"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

export default MenuSection;
