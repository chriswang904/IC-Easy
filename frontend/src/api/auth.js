/**
 * Authentication API Module
 */

import apiClient from './client';

/**
 * Register new user
 */
export const register = async ({ email, username, password }) => {
  try {
    const response = await apiClient.post('/api/auth/register', {
      email,
      username,
      password
    });
    
    // Save token and user info
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    console.log('[Auth] Registration successful:', response.data.user.username);
    return response.data;
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async ({ username, password }) => {
  try {
    // OAuth2 expects URL-encoded body, not JSON
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    console.log("[Auth] Sending login data:", params.toString());

    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("[Auth] Raw Response Status:", response.status);
    console.log("[Auth] Raw Headers:", [...response.headers.entries()]);

    // Try to parse error safely
    if (!response.ok) {
      let errorMessage = "";
      try {
        const text = await response.text();
        console.error("[Auth] Raw error text:", text);
        errorMessage = text;
      } catch (err) {
        console.error("[Auth] Could not read response text");
      }
      throw new Error(errorMessage || `Login failed (status ${response.status})`);
    }

    // If response is ok
    const data = await response.json();
    console.log("[Auth] Login successful:", data);

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    throw error;
  }
};



/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  console.log('[Auth] User logged out');
};

/**
 * Get current user from server
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('[Auth] Failed to get current user:', error);
    throw error;
  }
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error.message || 'An error occurred';
};