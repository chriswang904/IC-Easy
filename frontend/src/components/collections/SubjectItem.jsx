// import React, { useState, useEffect, useRef } from "react";
// import {
//   FileText,
//   FolderPlus,
//   ChevronRight,
//   ChevronDown,
//   MoreVertical,
//   Trash2,
//   Edit2,
// } from "lucide-react";

// function SubjectItem({
//   item,
//   subjectId,
//   level = 0,
//   activeTopicId,
//   searchQuery,
//   onTopicClick,
//   onEdit,
//   onDelete,
// }) {
//   const [expanded, setExpanded] = useState(false);
//   const [showContextMenu, setShowContextMenu] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editValue, setEditValue] = useState(item.name);
//   const contextMenuRef = useRef(null);

//   useEffect(() => {
//     if (searchQuery.trim()) {
//       setExpanded(true);
//     }
//   }, [searchQuery]);

//   // Close context menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
//         setShowContextMenu(false);
//       }
//     };

//     if (showContextMenu) {
//       document.addEventListener("mousedown", handleClickOutside);
//       return () => document.removeEventListener("mousedown", handleClickOutside);
//     }
//   }, [showContextMenu]);

//   const paddingLeft = `${(level + 1) * 16}px`;
//   const isActive = item.type === "topic" && item.id === activeTopicId;

//   const handleEdit = () => {
//     setIsEditing(true);
//     setShowContextMenu(false);
//   };

//   const saveEdit = () => {
//     if (editValue.trim() && editValue !== item.name) {
//       onEdit(item.id, editValue.trim());
//     }
//     setIsEditing(false);
//   };

//   const cancelEdit = () => {
//     setEditValue(item.name);
//     setIsEditing(false);
//   };

// //   // -----------------------------
// //   // Render Topic Item
// //   // -----------------------------
// //   if (item.type === "topic") {
// //     return (
// //       <div className="relative group">
// //         {isEditing ? (
// //           <input
// //             type="text"
// //             value={editValue}
// //             onChange={(e) => setEditValue(e.target.value)}
// //             onBlur={saveEdit}
// //             onKeyDown={(e) => {
// //               if (e.key === "Enter") saveEdit();
// //               if (e.key === "Escape") cancelEdit();
// //             }}
// //             className="w-full px-3 py-2 text-sm border border-[#e8def8] rounded focus:outline-none focus:ring-2 focus:ring-[#e8def8]"
// //             style={{ paddingLeft }}
// //             autoFocus
// //           />
// //         ) : (
// //           <button
// //             onClick={() => onTopicClick(item.id, item.name)}
// //             className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition ${
// //               isActive
// //                 ? "bg-purple-200 text-[#4a4459] font-medium"
// //                 : "text-gray-700 hover:bg-[#e8def8]/50"
// //             }`}
// //             style={{ paddingLeft }}
// //           >
// //             <FolderPlus className="w-4 h-4 text-gray-500 flex-shrink-0" />
// //             <span className="truncate text-left flex-1">{item.name}</span>
// //             {/* inner action changed to span */}
// //             <span
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 setShowContextMenu(!showContextMenu);
// //               }}
// //               className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded transition cursor-pointer"
// //             >
// //               <MoreVertical className="w-3 h-3" />
// //             </span>
// //           </button>
// //         )}

// //         {showContextMenu && (
// //           <div
// //             ref={contextMenuRef}
// //             className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-1 w-32 border border-gray-200 z-50"
// //           >
// //             <button
// //               onClick={handleEdit}
// //               className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
// //             >
// //               <Edit2 className="w-4 h-4" />
// //               Rename
// //             </button>
// //             <button
// //               onClick={() => {
// //                 onDelete(item.id);
// //                 setShowContextMenu(false);
// //               }}
// //               className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
// //             >
// //               <Trash2 className="w-4 h-4" />
// //               Delete
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     );
// //   }

//   // -----------------------------
//   // Render Group Item
//   // -----------------------------
//   return (
//     <div>
//       <div className="relative group">
//         {isEditing ? (
//           <input
//             type="text"
//             value={editValue}
//             onChange={(e) => setEditValue(e.target.value)}
//             onBlur={saveEdit}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") saveEdit();
//               if (e.key === "Escape") cancelEdit();
//             }}
//             className="w-full px-3 py-2 text-sm border border-[#e8def8] rounded focus:outline-none focus:ring-2 focus:ring-[#e8def8]"
//             style={{ paddingLeft }}
//             autoFocus
//           />
//         ) : (
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#e8def8]/50 rounded transition"
//             style={{ paddingLeft }}
//           >
//             {expanded ? (
//               <ChevronDown className="w-4 h-4 flex-shrink-0" />
//             ) : (
//               <ChevronRight className="w-4 h-4 flex-shrink-0" />
//             )}
//             <FolderPlus className="w-4 h-4 text-gray-500 flex-shrink-0" />
//             <span className="truncate text-left flex-1">{item.name}</span>
//             {/* inner action changed to span */}
//             <span
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowContextMenu(!showContextMenu);
//               }}
//               className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded transition cursor-pointer"
//             >
//               <MoreVertical className="w-3 h-3" />
//             </span>
//           </button>
//         )}

//         {showContextMenu && (
//           <div
//             ref={contextMenuRef}
//             className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-1 w-32 border border-gray-200 z-50"
//           >
//             <button
//               onClick={handleEdit}
//               className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
//             >
//               <Edit2 className="w-4 h-4" />
//               Rename
//             </button>
//             <button
//               onClick={() => {
//                 onDelete(item.id);
//                 setShowContextMenu(false);
//               }}
//               className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
//             >
//               <Trash2 className="w-4 h-4" />
//               Delete
//             </button>
//           </div>
//         )}
//       </div>

//       {expanded && item.items && item.items.length > 0 && (
//         <div className="ml-2">
//           {item.items.map((subItem) => (
//             <SubjectItem
//               key={subItem.id}
//               item={subItem}
//               subjectId={subjectId}
//               level={level + 1}
//               activeTopicId={activeTopicId}
//               searchQuery={searchQuery}
//               onTopicClick={onTopicClick}
//               onEdit={onEdit}
//               onDelete={onDelete}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SubjectItem;
