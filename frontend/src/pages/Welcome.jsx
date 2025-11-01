import React, { useState, useEffect } from "react";
import { updateUserProfile } from "../api/user";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [avatarStyle, setAvatarStyle] = useState("adventurer");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewSeed] = useState("preview123");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load user and initialize avatar
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);

      // Initialize with existing data if available
      if (storedUser.avatar_url) {
        setAvatarUrl(storedUser.avatar_url);
      } else {
        const randomSeed = Math.random().toString(36).substring(2, 10);
        setAvatarUrl(
          `https://api.dicebear.com/9.x/adventurer/svg?seed=${randomSeed}`
        );
      }

      if (storedUser.interests && storedUser.interests.length > 0) {
        setInterests(storedUser.interests);
      }
    }
  }, []);

  const generateAvatar = (style = avatarStyle) => {
    const newSeed = Math.random().toString(36).substring(2, 10);
    setAvatarUrl(`https://api.dicebear.com/9.x/${style}/svg?seed=${newSeed}`);
  };

  const handleStyleChange = (style) => {
    setAvatarStyle(style);
    generateAvatar(style);
  };

  const handleSubmit = async () => {
    if (interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log("[Welcome] Saving profile:", {
        interests,
        avatar_url: avatarUrl,
      });

      // ✅ Call API and get updated user data
      const updatedUserData = await updateUserProfile({
        interests,
        avatar_url: avatarUrl,
      });

      console.log("[Welcome] Profile saved successfully:", updatedUserData);

      // ✅ Update localStorage with complete user data
      const completeUserData = {
        ...user,
        ...updatedUserData,
        interests: updatedUserData.interests || interests,
        avatar_url: updatedUserData.avatar_url || avatarUrl,
      };

      localStorage.setItem("user", JSON.stringify(completeUserData));
      console.log("[Welcome] localStorage updated:", completeUserData);

      // ✅ Navigate to homepage
      navigate("/explore");
    } catch (err) {
      console.error("[Welcome] Failed to save profile:", err);
      setError("Failed to save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    console.log("[Welcome] User skipped profile setup");
    navigate("/explore");
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const styles = [
    "adventurer",
    "bottts",
    "pixel-art",
    "avataaars",
    "identicon",
    "shapes",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to IC-Easy
        </h1>
        <p className="text-gray-600 mb-6">
          Customize your profile by choosing an avatar and your interests.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-3"
          />
          <div className="flex flex-col items-center gap-3">
            {/* Style Selector with Inline Previews */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-row flex-wrap justify-center gap-2 mb-2">
                {styles.map((style) => (
                  <div
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    className={`border rounded-lg p-1 cursor-pointer hover:border-purple-500 transition ${
                      avatarStyle === style
                        ? "border-purple-500 border-2"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/9.x/${style}/svg?seed=${previewSeed}`}
                      alt={style}
                      className="w-10 h-10"
                      title={style}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Randomize Button */}
            <button
              onClick={() => generateAvatar(avatarStyle)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Randomize Avatar
            </button>
          </div>
        </div>

        {/* Interests */}
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          Select your interests
        </label>

        <div className="flex flex-wrap gap-2 mb-6 justify-start">
          {[
            { value: "AI", label: "Artificial Intelligence" },
            { value: "Biology", label: "Biology" },
            { value: "Economics", label: "Economics" },
            { value: "Medicine", label: "Medicine" },
            { value: "Physics", label: "Physics" },
            { value: "Environment", label: "Environment" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setInterests((prev) =>
                  prev.includes(item.value)
                    ? prev.filter((v) => v !== item.value)
                    : [...prev, item.value]
                );
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                interests.includes(item.value)
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || interests.length === 0}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "Save and Continue"}
          </button>
          <button
            onClick={handleSkip}
            disabled={saving}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Skip
          </button>
        </div>

        {interests.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Please select at least one interest to continue
          </p>
        )}
      </div>
    </div>
  );
}
