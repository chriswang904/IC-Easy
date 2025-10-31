import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

export default function SelectCollectionDialog({ isOpen, onClose, onConfirm }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  // --- Load subjects ---
  useEffect(() => {
    if (!isOpen) return;
    const stored = localStorage.getItem("subjects");
    if (stored) {
      try {
        setSubjects(JSON.parse(stored));
      } catch {
        setSubjects([]);
      }
    }
  }, [isOpen]);

  const saveSubjects = (updated) => {
    setSubjects(updated);
    localStorage.setItem("subjects", JSON.stringify(updated));
  };

  // --- Add New Subject ---
  const handleAddSubject = () => {
    const name = prompt("Enter new subject name:");
    if (!name || !name.trim()) return;
    const newSubject = { id: Date.now(), name: name.trim(), items: [] };
    const updated = [...subjects, newSubject];
    saveSubjects(updated);
    setSelectedSubject(newSubject.id);
    setSelectedGroup("");
  };

  // --- Add New Group ---
  const handleAddGroup = () => {
    if (!selectedSubject) return alert("Select a subject first.");
    const name = prompt("Enter new group name:");
    if (!name || !name.trim()) return;
    const updated = subjects.map((s) =>
      s.id === Number(selectedSubject)
        ? { ...s, items: [...(s.items || []), { id: Date.now(), name: name.trim() }] }
        : s
    );
    saveSubjects(updated);
    const newGroup = updated
      .find((s) => s.id === Number(selectedSubject))
      .items.slice(-1)[0];
    setSelectedGroup(newGroup.id);

    alert(`Created new group "${name.trim()}". It has been auto-selected.`);
  };

  // --- Confirm ---
  const handleConfirm = () => {
    if (!selectedSubject || !selectedGroup) {
      alert("Please select both subject and group.");
      return;
    }
    onConfirm(selectedSubject, selectedGroup);
  };

  const currentSubject = subjects.find((s) => s.id === Number(selectedSubject));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Add to Collection</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Choose where to save this paper
            </p>

            {/* Subject Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedGroup("");
                  }}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddSubject}
                  className="p-2 border rounded-lg hover:bg-purple-50 text-purple-600 border-purple-200"
                  title="Add new subject"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Group Select */}
            {selectedSubject && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Select a group...</option>
                    {(currentSubject?.items || []).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddGroup}
                    className="p-2 border rounded-lg hover:bg-purple-50 text-purple-600 border-purple-200"
                    title="Add new group"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t pt-4 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add to Collection
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
