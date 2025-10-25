import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import {
  Edit,
  Archive,
  Globe,
  Sparkles,
  User,
  LogOut,
  Origami,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  let menuTimeout = null;

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          console.log("[Sidebar] User loaded:", parsedUser);
        } catch (e) {
          console.error("[Sidebar] Failed to parse user:", e);
        }
      }
    };

    loadUser();

    const handleProfileUpdate = () => {
      console.log("[Sidebar] Profile updated, reloading user...");
      loadUser();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setImageError(false);
    navigate("/login");
  };

  const handleMouseEnter = () => {
    if (menuTimeout) clearTimeout(menuTimeout);
    setShowUserMenu(true);
  };

  const handleMouseLeave = () => {
    menuTimeout = setTimeout(() => setShowUserMenu(false), 300);
  };

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  const navigationItems = [
    { icon: Sparkles, label: "TextLab", path: "/aitool" },
    { icon: Archive, label: "Collections", path: "/collections" },
    { icon: Globe, label: "Explore", path: "/explore" },
    { icon: Origami, label: "Polish", path: "/polish" },
  ];

  const UserAvatar = ({ size = "w-8 h-8" }) => {
    const avatarSrc = user?.picture || user?.avatar_url;

    if (avatarSrc && !imageError) {
      return (
        <img
          src={avatarSrc}
          alt={`${user.username}'s profile`}
          className={`${size} rounded-full border-2 border-purple-300 object-cover`}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ${
          size === "w-8 h-8" ? "text-sm" : "text-base"
        }`}
      >
        {user.username?.[0]?.toUpperCase() || "U"}
      </div>
    );
  };


  return (
    <nav className="fixed left-0 top-0 h-screen flex flex-col items-center w-20 pt-11 pb-6 bg-gradient-to-b from-purple-100 to-pink-100">
      <div className="flex flex-col items-center gap-1">
        {/* Logo */}
        <button
          onClick={() => {
            navigate("/", { replace: false });
            window.dispatchEvent(new Event("reset-search"));
          }}
          className="p-2 hover:bg-white/50 rounded-2xl transition-all duration-300 hover:scale-110"
        >
          <img
            src="/IC_EASY_LOGO.webp"
            alt="IC-Easy Logo"
            className="w-12 h-12 object-contain"
          />
        </button>

        {/* New Essay */}
        <button
          onClick={() => navigate("/essay/new")}
          className={`p-4 rounded-2xl transition ${
            location.pathname === "/essay/new"
              ? "bg-purple-500 text-white shadow-lg"
              : "bg-purple-300 hover:bg-purple-400"
          }`}
        >
          <Edit size={24} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center gap-4 w-full mt-8">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname.startsWith(item.path); 
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-0 py-1.5 w-full rounded-lg transition 
                ${
                  isActive
                    ? "bg-white/70 shadow-md text-purple-700 scale-105"
                    : "hover:bg-white/30 text-gray-700"
                }`}
            >
              <div className="p-2">
                <item.icon
                  className={`w-6 h-6 transition ${
                    isActive ? "text-purple-600" : "text-gray-700"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-purple-700" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="mt-auto">
        {user ? (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/30 rounded-lg transition">
              <UserAvatar />
              <span className="text-xs text-gray-600 truncate max-w-[60px]">
                {user.username}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-0 left-full ml-2 bg-white shadow-xl rounded-lg p-3 w-48 border border-gray-200 z-50">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  <UserAvatar size="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded transition"
                >
                  <User className="w-4 h-4" /> Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/30 rounded-lg transition"
          >
            <User className="w-6 h-6 text-gray-700" />
            <span className="text-xs text-gray-600">Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default Sidebar;
