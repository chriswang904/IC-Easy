import React, { useState } from "react";

function MenuSection() {
  const [activeItem, setActiveItem] = useState(10);

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

  return (
    <nav
      className="flex max-w-[300px] w-[300px] h-screen items-start px-0 py-2 bg-[#f5eff7]"
      role="navigation"
      aria-label="Main menu"
    >
      <ul className="flex flex-col items-start relative flex-1 grow overflow-auto">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
          >
            <button
              onClick={() => setActiveItem(item.id)}
              className={`flex h-14 items-center gap-3 px-3 py-2 relative self-stretch w-full ${
                item.id === activeItem ? "bg-[#e8def8]" : ""
              }`}
              type="button"
              aria-current={item.id === activeItem ? "page" : undefined}
            >
              <span className="items-start flex-1 grow flex flex-col relative">
                <span
                  className={`${
                    item.id === activeItem
                      ? "flex items-center justify-center"
                      : "self-stretch"
                  } mt-[-1.00px] [font-family:'Roboto-Regular',Helvetica] font-normal ${
                    item.id === activeItem ? "text-[#4a4459]" : "text-[#1d1b20]"
                  } text-base leading-6 relative ${
                    item.id === activeItem
                      ? "self-stretch"
                      : "flex items-center justify-center"
                  } tracking-[0.50px]`}
                >
                  {item.label}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="relative self-stretch w-3" aria-hidden="true">
        <div className="absolute h-[calc(100%_-_122px)] top-0 right-1 w-1 bg-[#79747e] rounded-[100px]" />
      </div>
    </nav>
  );
}

export default MenuSection;
