/**
 * Recommendations API Module
 * Fetches personalized literature recommendations
 */

import apiClient from "./client";
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://ic-easy-backend.onrender.com";

/**
 * Get personalized recommendations based on user interests
 * @param {number} limit - Number of recommendations to fetch
 * @returns {Promise<Object>} Recommendations data
 */
export const getPersonalizedRecommendations = async (limit = 15) => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/api/recommendations/personalized`,
      {
        params: { limit },
      }
    );

    console.log("[Recommendations] Personalized recommendations fetched:", {
      total: response.data.total,
      personalized: response.data.personalized,
      topics: response.data.topics,
    });

    return response.data;
  } catch (error) {
    console.error(
      "[Recommendations] Failed to fetch personalized recommendations:",
      error
    );
    throw error;
  }
};

/**
 * Get recommendations for a specific interest
 * @param {string} interest - Interest category (AI, Biology, etc.)
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Object>} Recommendations data
 */
export const getRecommendationsByInterest = async (interest, limit = 10) => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/api/recommendations/by-interest/${interest}`,
      {
        params: { limit },
      }
    );

    console.log(
      `[Recommendations] Recommendations for ${interest} fetched:`,
      response.data.total
    );

    return response.data;
  } catch (error) {
    console.error(
      `[Recommendations] Failed to fetch recommendations for ${interest}:`,
      error
    );
    throw error;
  }
};

/**
 * Check recommendations service health
 * @returns {Promise<Object>} Health status
 */
export const checkRecommendationsHealth = async () => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/api/recommendations/health`
    );
    return response.data;
  } catch (error) {
    console.error("[Recommendations] Health check failed:", error);
    return { status: "unhealthy" };
  }
};
