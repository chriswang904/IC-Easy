// api/plagiarism.js 

import apiClient from "./client";

/**
 * Check text plagiarism and AI detection (NO reference texts needed)
 * Uses Longformer model for plagiarism + ensemble AI detector
 * 
 * @param {Object} params
 * @param {string} params.text - Text to check
 * @param {boolean} [params.check_ai=true] - Include AI detection
 * @returns {Promise<Object>} Check results
 */
export const checkTextPlagiarism = async ({ text, check_ai = true }) => {
  try {
    const response = await apiClient.post("/api/plagiarism/check-text", {
      text,
      check_ai,
    });
    return response.data;
  } catch (error) {
    console.error("[Check Text Plagiarism] Error:", error);
    throw error;
  }
};

/**
 * Check file plagiarism and AI detection
 * Supports .txt, .docx, .pdf files
 * 
 * @param {File} file - File to check
 * @param {boolean} [check_ai=true] - Include AI detection
 * @returns {Promise<Object>} Check results
 */
export const checkFilePlagiarism = async (file, check_ai = true) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("check_ai", check_ai);

    const response = await apiClient.post("/api/plagiarism/check-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        check_ai: check_ai
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("[Check File Plagiarism] Error:", error);
    throw error;
  }
};

/**
 * Extract text from file (client-side - for preview only)
 * Backend handles actual extraction
 */
export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    // Only for preview - backend does real extraction
    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      // For DOCX/PDF, just resolve with filename
      resolve(`[File: ${file.name}]`);
    }
  });
};

// Legacy compatibility exports (not used with new backend)
export const checkPlagiarism = checkTextPlagiarism;
export const compareTexts = async ({ text1, text2, method = "tfidf" }) => {
  console.warn("[API] compareTexts not supported by new backend");
  return { error: "Not supported" };
};
export const batchCheckPlagiarism = async (checkRequests) => {
  console.warn("[API] batchCheckPlagiarism not supported by new backend");
  return { error: "Not supported" };
};
export const getPlagiarismStats = (checkResult) => {
  return {
    plagiarism_probability: checkResult.plagiarism_probability || 0,
    risk_level: checkResult.plagiarism_risk || "low",
    ai_probability: checkResult.ai_probability || 0,
    is_ai_generated: checkResult.is_ai_generated || false,
  };
};