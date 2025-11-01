// api/index.js
import apiClient from "./client";

export { default as apiClient, checkApiHealth, getApiInfo } from "./client";

export * from "./auth";
export * from "./history";
export * from "./papers";
export * from "./recommendations";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 120000, // 2 minutes for AI operations
  DEFAULT_LIMIT: 10,
  SOURCES: ["crossref", "arxiv", "openalex"],
  FORMATS: ["apa", "ieee", "mla"],
  PLAGIARISM_METHODS: ["longformer"],
};

export {
  register,
  login,
  logout,
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
} from "./auth";

export {
  getSearchHistory,
  getTrendingKeywords,
  advancedSearch,
} from "./history";

/**
 * Get error message from API error response
 *
 * @param {Error} error - Error object from API call
 * @returns {string} Formatted error message
 */
export const getErrorMessage = (error) => {
  // Handle Pydantic validation errors (array format)
  if (
    error.response?.data?.detail &&
    Array.isArray(error.response.data.detail)
  ) {
    return error.response.data.detail
      .map((err) => {
        const field = err.loc?.join(" > ") || "Field";
        return `${field}: ${err.msg}`;
      })
      .join(", ");
  }

  // Handle standard error detail
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === "string") {
      return error.response.data.detail;
    }
    if (typeof error.response.data.detail === "object") {
      return (
        error.response.data.detail.msg ||
        JSON.stringify(error.response.data.detail)
      );
    }
  }

  // Handle other error formats
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};

/**
 * Check document for AI-generated content using Winston AI
 *
 * @param {File} file - Document file to analyze
 * @param {boolean} use_api - Whether to use Winston AI API (default: true)
 * @returns {Promise<Object>} AI detection results
 * @throws {Error} If file validation fails or API call fails
 */
export const checkAIOnly = async (file, use_api = true) => {
  // Validate file size (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds 10MB limit. Your file is ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    );
  }

  // Validate file type
  const allowedExtensions = [".txt", ".pdf", ".doc", ".docx"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    throw new Error(
      `Invalid file type. Please upload: ${allowedExtensions.join(", ")}`
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("use_api", use_api);

  console.log(
    `[Check AI Only] Uploading file: ${file.name} (${(file.size / 1024).toFixed(
      2
    )}KB)`
  );
  console.log(`[Check AI Only] Using Winston AI API: ${use_api}`);

  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/api/ai/check-ai-only`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutes timeout for AI analysis
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`[Check AI Only] Upload progress: ${percentCompleted}%`);
        },
      }
    );

    console.log("[Check AI Only] Winston AI check completed successfully");
    return response.data;
  } catch (error) {
    console.error("[Check AI Only] Error:", error);

    // Enhanced error handling
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      throw new Error(
        "Request timeout: Winston AI is taking longer than expected. This may be due to model loading on first use. Please try again."
      );
    }

    if (error.response?.status === 413) {
      throw new Error("File too large for server to process");
    }

    if (error.response?.status === 500) {
      throw new Error(
        "Server error during AI analysis. Please try again or contact support."
      );
    }

    throw error;
  }
};
