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
    // OAuth2 requires FormData
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await apiClient.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Save token and user info
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    console.log('[Auth] Login successful:', response.data.user.username);
    return response.data;
  } catch (error) {
    console.error('[Auth] Login failed:', error);
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