import React, { useState, useEffect } from "react";
import { LogOut, RefreshCcw, Save, Check, Edit2 } from "lucide-react";
import { updateUserProfile } from "../api/user";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [interests, setInterests] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);

  const availableInterests = [
    { id: "AI", label: "Artificial Intelligence", emoji: "🤖" },
    { id: "Biology", label: "Biology", emoji: "🧬" },
    { id: "Economics", label: "Economics", emoji: "📈" },
    { id: "Medicine", label: "Medicine", emoji: "⚕️" },
    { id: "Physics", label: "Physics", emoji: "⚛️" },
    { id: "Environment", label: "Environment", emoji: "🌍" },
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setUsername(storedUser.username);
      setInterests(storedUser.interests || []);
      setAvatarUrl(
        storedUser.avatar_url ||
          `https://api.dicebear.com/9.x/adventurer/svg?seed=${storedUser.username}`
      );
    }
  }, []);

  const handleAvatarChange = () => {
    const newSeed = Math.random().toString(36).substring(2, 8);
    setAvatarUrl(`https://api.dicebear.com/9.x/adventurer/svg?seed=${newSeed}`);
  };

  const toggleInterest = (interestId) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("[Profile] Saving profile - username:", username, "interests:", interests);

      const updated = await updateUserProfile({
        username: username,
        interests,
        avatar_url: avatarUrl,
      });

      console.log("[Profile] Profile saved successfully:", updated);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updated));
      console.log("[Profile] User saved to localStorage");

      // Set timestamp for change detection when navigating back
      const timestamp = Date.now().toString();
      localStorage.setItem("profile_update_time", timestamp);
      console.log("[Profile] Timestamp saved:", timestamp);

      // Dispatch custom event to notify other components (like Homepage)
      const event = new CustomEvent("profile-updated", {
        detail: { user: updated },
      });
      window.dispatchEvent(event);

      console.log("[Profile] Profile saved and event dispatched");

      alert("Profile updated successfully! ✓");
      setEditingUsername(false);
      setUser(updated);
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
    } catch (err) {
      console.error("Update failed:", err);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (err.response && err.response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex justify-center items-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-500 text-sm">Manage your account settings</p>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <img
              src={avatarUrl}
              alt="avatar"
              className="relative w-32 h-32 rounded-full ring-4 ring-white shadow-lg"
            />
          </div>
          <button
            onClick={handleAvatarChange}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-all duration-200"
          >
            <RefreshCcw className="w-4 h-4" /> Change Avatar
          </button>
        </div>

        {/* User Info Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Username - Editable */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                Username
                <button
                  onClick={() => setEditingUsername(!editingUsername)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </label>
              {editingUsername ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-lg font-semibold text-gray-800 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter username"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {username}
                </p>
              )}
            </div>
            {/* Email - Read-only */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </label>
              <p className="text-lg font-semibold text-gray-800 mt-1 break-all">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-4">
            Research Interests
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Select topics you're interested in (click to toggle)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableInterests.map((interest) => {
              const isSelected = interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`
                    relative px-3 py-3 rounded-xl font-medium text-xs
                    transition-all duration-200 transform hover:scale-105
                    ${
                      isSelected
                        ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-300"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-base flex-shrink-0">{interest.emoji}</span>
                      <span className="truncate text-left leading-tight">
                        {interest.label}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {interests.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {interests.length} interest{interests.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 flex justify-center items-center gap-2 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}