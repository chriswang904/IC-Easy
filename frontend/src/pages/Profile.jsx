import React, { useState, useEffect } from "react";
import { LogOut, RefreshCcw, Save } from "lucide-react";
import { updateUserProfile } from "../api/user";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
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

  const handleInterestChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (o) => o.value);
    setInterests(values);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("[Profile] Saving profile with interests:", interests);

      const updated = await updateUserProfile({
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

      alert("Profile updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile");
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex justify-center items-start p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Profile
        </h1>

        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-3"
          />
          <button
            onClick={handleAvatarChange}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
          >
            <RefreshCcw className="w-4 h-4" /> Change Avatar
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 font-medium">Username: {user.username}</p>
          <p className="text-gray-700 font-medium">Email: {user.email}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <select
            multiple
            value={interests}
            onChange={handleInterestChange}
            className="w-full border-gray-300 rounded-lg p-2"
          >
            <option value="AI">Artificial Intelligence</option>
            <option value="Biology">Biology</option>
            <option value="Economics">Economics</option>
            <option value="Medicine">Medicine</option>
            <option value="Physics">Physics</option>
            <option value="Environment">Environment</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 flex justify-center items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 flex justify-center items-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}
