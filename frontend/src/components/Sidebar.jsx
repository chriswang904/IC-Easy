import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Edit, Archive, Globe, Sparkles, User } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const navigationItems = [
    { icon: Sparkles, label: "AITool", path: "/aitool" },
    { icon: Archive, label: "Collections", path: "/collections" },
    { icon: Globe, label: "Explore", path: "/explore" },
  ];

  return (
    <nav
      className="fixed left-0 top-0 h-screen flex flex-col items-center w-20 pt-11 pb-6 bg-gradient-to-b from-purple-100 to-pink-100"
      aria-label="Main navigation"
    >

      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => navigate("/")}
          className="p-4 hover:bg-white/50 rounded-2xl transition"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => navigate("/essay/new")}
          className="p-4 bg-purple-300 rounded-2xl"
          aria-label="Active view"
          aria-current="Edit"
        >
          <Edit size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 w-full mt-8">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center gap-1 px-0 py-1.5 w-full hover:bg-white/30 rounded-lg transition"
            aria-label={item.label}
          >
            <div className="p-2">
              <item.icon className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-xs text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={() => navigate("/login")}
          className="flex flex-col items-center gap-1 p-2 hover:bg-white/30 rounded-lg transition"
          aria-label="Login"
        >
          <User className="w-6 h-6 text-gray-700" />
          <span className="text-xs text-gray-600">Login</span>
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
