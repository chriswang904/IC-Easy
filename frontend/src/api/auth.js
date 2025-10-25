/**
 * Authentication API Module
 */

import apiClient from "./client";

/**
 * Register new user
 */
export const register = async ({ email, username, password }) => {
  try {
    const response = await apiClient.post("/api/auth/register", {
      email,
      username,
      password,
    });

    // Save token and user info
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    console.log("[Auth] Registration successful:", response.data.user.username);
    return response.data;
  } catch (error) {
    console.error("[Auth] Registration failed:", error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async ({ username, password }) => {
  try {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    console.log("[Auth] Sending login data:", params.toString());

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    console.log("[Auth] Raw Response Status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Login failed (status ${response.status})`);
    }

    const data = await response.json();
    console.log("[Auth] Login successful, raw data:", data);

    const user = data.user ?? data;

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      login_method: user.login_method || "email",
      avatar_url:
        user.avatar_url ||
        data.avatar_url ||
        `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.username || username}`,
      interests: Array.isArray(user.interests)
        ? user.interests
        : (typeof user.interests === "string"
            ? (() => { try { return JSON.parse(user.interests); } catch { return []; } })()
            : []),
      access_token: data.access_token,
      is_new_user: !!data.is_new_user,
    };

    localStorage.setItem("access_token", userData.access_token || "");
    localStorage.setItem("user", JSON.stringify(userData));

    console.log("[Auth] User saved to localStorage:", userData);
    return userData; 
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    throw error;
  }
};





/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  console.log("[Auth] User logged out");
};

/**
 * Get current user from server
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  } catch (error) {
    console.error("[Auth] Failed to get current user:", error);
    throw error;
  }
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error.message || "An error occurred";
};
