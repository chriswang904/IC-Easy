import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Edit, Archive, Globe, Sparkles, User, LogOut } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false); 
  
  let menuTimeout = null;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        console.log('[Sidebar] User loaded:', parsedUser);
        console.log('[Sidebar] Picture URL:', parsedUser.picture); 
      } catch (e) {
        console.error('[Sidebar] Failed to parse user from localStorage:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setImageError(false); 
    console.log('[Sidebar] User logged out');
    navigate('/login');
  };

  const handleMouseEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
    }
    setShowUserMenu(true);
  };

  const handleMouseLeave = () => {
    menuTimeout = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  const handleImageError = () => {
    console.error('[Sidebar] Failed to load profile picture:', user.picture);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('[Sidebar] Profile picture loaded successfully');
    setImageError(false);
  };

  const navigationItems = [
    { icon: Sparkles, label: "AITool", path: "/aitool" },
    { icon: Archive, label: "Collections", path: "/collections" },
    { icon: Globe, label: "Explore", path: "/explore" },
  ];

  const UserAvatar = ({ size = "w-8 h-8" }) => {
    if (user.picture && !imageError) {
      return (
        <img 
          src={user.picture} 
          alt={`${user.username}'s profile`}
          className={`${size} rounded-full border-2 border-purple-300 object-cover`}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ${size === "w-8 h-8" ? "text-sm" : "text-base"}`}>
        {user.username?.[0]?.toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <nav
      className="fixed left-0 top-0 h-screen flex flex-col items-center w-20 pt-11 pb-6 bg-gradient-to-b from-purple-100 to-pink-100"
      aria-label="Main navigation"
    >
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => navigate("/")}
          className="p-4 hover:bg-white/50 rounded-2xl transition"
          aria-label="Go to homepage"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => navigate("/essay/new")}
          className="p-4 bg-purple-300 rounded-2xl"
          aria-label="Create new essay"
          aria-current="page"
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
            aria-label={`Navigate to ${item.label}`}
          >
            <div className="p-2">
              <item.icon className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-xs text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        {user ? (
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/30 rounded-lg transition">
              {/* UserAvatar*/}
              <UserAvatar />
              <span className="text-xs text-gray-600 truncate max-w-[60px]">
                {user.username}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute bottom-0 left-full ml-2 bg-white shadow-xl rounded-lg p-3 w-48 border border-gray-200 z-50">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  {/* UserAvatar  */}
                  <UserAvatar size="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" title={user.username}>
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/30 rounded-lg transition"
            aria-label="Go to login page"
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