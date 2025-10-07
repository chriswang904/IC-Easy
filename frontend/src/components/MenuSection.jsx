import React, { useState } from "react";

function MenuSection({ activeItem: activeItemLabel, onItemChange }) {
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { id: 1, label: "All Items" },
    { id: 2, label: "Notes" },
    { id: 3, label: "Essays" },
    { id: 4, label: "Papers" },
    { id: 5, label: "Favorites" },
    { id: 6, label: "Shared" },
    { id: 7, label: "Archive" },
    { id: 8, label: "Trash" },
    { id: 9, label: "Tags" },
    { id: 10, label: "Recent" },
    { id: 11, label: "Downloads" },
    { id: 12, label: "Settings" },
  ];

  const handleItemClick = (item) => {
    if (onItemChange) {
      onItemChange(item.label);
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav
      className="flex flex-col w-full h-full bg-[#ffffff]"
      role="navigation"
      aria-label="Main menu"
    >
      {/* Search Bar - Sticky positioning keeps it at top while scrolling */}
      <div className="sticky top-0 z-10 px-8 py-12 bg-[#ffffff] ">
        <div className="relative">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8def8] focus:border-transparent"
            aria-label="Search menu items"
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

      {/* Menu Items - Takes remaining space and allows scrolling */}
      <div className="flex w-full flex-1 px-4 py-2 items-start overflow-hidden relative">
        <ul className="flex flex-col items-start w-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
              >
                <button
                  onClick={() => handleItemClick(item)}
                  className={`flex h-14 items-center gap-3 px-3 py-2 relative self-stretch w-full ${
                    item.label === activeItemLabel ? "bg-[#e8def8]" : ""
                  }`}
                  type="button"
                  aria-current={
                    item.label === activeItemLabel ? "page" : undefined
                  }
                >
                  <span className="items-start flex-1 grow flex flex-col relative">
                    <span
                      className={`${
                        item.label === activeItemLabel
                          ? "flex items-center justify-center"
                          : "self-stretch"
                      } mt-[-1.00px] [font-family:'Roboto-Regular',Helvetica] font-normal ${
                        item.label === activeItemLabel
                          ? "text-[#4a4459]"
                          : "text-[#1d1b20]"
                      } text-base leading-6 relative ${
                        item.label === activeItemLabel
                          ? "self-stretch"
                          : "flex items-center justify-center"
                      } tracking-[0.50px]`}
                    >
                      {item.label}
                    </span>
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="flex items-center justify-center w-full py-8 text-gray-500 text-sm">
              No items found
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default MenuSection;
