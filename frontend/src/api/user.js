import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("[Auth] Token expired or invalid. Redirecting to /login...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

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
    
    const response = await axios.patch(
      `${API_BASE}/api/auth/user/update`, 
      data, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[User API] Profile updated successfully:", response.data);
    
    // Return the updated user data
    return response.data;
  } catch (error) {
    console.error("[User API] Update failed:", error);
    throw error;
  }
}

export default api;