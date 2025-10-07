/**
 * API Module - Central Export Point
 * 
 * This module exports all API functions for easy importing throughout
 * the frontend application.
 * 
 * @module api
 */

// Export client and utilities
export { default as apiClient, checkApiHealth, getApiInfo } from './client';

// Export literature/papers functions
export {
  searchLiterature,
  getLiteratureByDOI,
  getPaperByArxiv,
  getWorkByOpenAlex,
  formatReference,
  batchSearch,
  getRecommendations,
} from './papers';

// Export plagiarism functions
export {
  checkPlagiarism,
  compareTexts,
  batchCheckPlagiarism,
  getPlagiarismStats,
} from './plagiarism';


/**
 * API Configuration
 * Export configuration values that might be needed
 */
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  DEFAULT_LIMIT: 10,
  SOURCES: ['crossref', 'arxiv', 'openalex'],
  FORMATS: ['apa', 'ieee', 'mla'],
  PLAGIARISM_METHODS: ['tfidf', 'semantic'],
};

// Export authentication functions
export {
  register,
  login,
  logout,
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
} from './auth';

// Export history functions
export {
  getSearchHistory,
  getTrendingKeywords,
  advancedSearch,
} from './history';

/**
 * API Error Handler
 * Utility function to extract error messages from API errors
 * 
 * @param {Error} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};