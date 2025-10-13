import apiClient from "./client"; // ← Use the shared client

/**
 * Update user profile (interests and avatar)
 * @param {Object} data - { interests: [...], avatar_url: "..." }
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserProfile(data) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    console.log("[User API] Updating profile:", data);

    // Use apiClient instead of axios directly
    const response = await apiClient.patch("/api/auth/user/update", data);

    console.log("[User API] Profile updated successfully:", response.data);

    // Return the updated user data
    return response.data;
  } catch (error) {
    console.error("[User API] Update failed:", error);
    throw error;
  }
}

// If you need to export the api instance for other uses
export { default as api } from "./client";
