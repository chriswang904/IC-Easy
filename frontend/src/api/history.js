/**
 * History API Module
 *
 * Functions for search history and trending keywords
 */

import apiClient from "./client";
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://ic-easy-backend.onrender.com";
/**
 * Get recent search history
 *
 * @param {number} limit - Number of records to fetch
 * @returns {Promise<Array>} Search history records
 */
export const getSearchHistory = async (limit = 20) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/api/history/`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("[Get Search History] Error:", error);
    throw error;
  }
};

/**
 * Get trending keywords
 *
 * @param {number} days - Number of days to look back
 * @param {number} topK - Number of top keywords to return
 * @returns {Promise<Array>} Trending keywords with counts
 */
export const getTrendingKeywords = async (days = 7, topK = 10) => {
  try {
    const response = await apiClient.get("/api/history/trending", {
      params: { days, top_k: topK },
    });
    return response.data;
  } catch (error) {
    console.error("[History] Failed to get trending keywords:", error);
    throw error;
  }
};

/**
 * Advanced search across all sources with filters
 *
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Search keyword
 * @param {number} params.limit - Results per source
 * @param {Object} params.filters - Advanced filters
 * @returns {Promise<Object>} Search results
 */
export const advancedSearch = async ({
  keyword,
  limit = 10,
  filters = null,
}) => {
  try {
    const response = await apiClient.post("/api/literature/search-all", {
      keyword,
      limit,
      filters,
    });
    return response.data;
  } catch (error) {
    console.error("[History] Advanced search failed:", error);
    throw error;
  }
};
