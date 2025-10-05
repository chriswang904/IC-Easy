/**
 * Plagiarism Detection API Module
 * 
 * This module provides functions to interact with the plagiarism detection
 * endpoints of the backend API.
 * 
 * @module api/plagiarism
 */

import apiClient from './client';

/**
 * Check text for plagiarism
 * 
 * @param {Object} params - Plagiarism check parameters
 * @param {string} params.text - Text to check for plagiarism
 * @param {Array<string>} params.reference_texts - Reference texts to compare against
 * @param {string} [params.method='tfidf'] - Detection method (tfidf|semantic)
 * @param {number} [params.threshold=0.7] - Similarity threshold (0-1)
 * @returns {Promise<Object>} Plagiarism check results
 * 
 * @example
 * const result = await checkPlagiarism({
 *   text: 'This is my essay text...',
 *   reference_texts: [
 *     'Reference document 1...',
 *     'Reference document 2...'
 *   ],
 *   method: 'tfidf',
 *   threshold: 0.7
 * });
 */
export const checkPlagiarism = async ({ 
  text, 
  reference_texts, 
  method = 'tfidf', 
  threshold = 0.7 
}) => {
  try {
    const response = await apiClient.post('/api/plagiarism/check', {
      text,
      reference_texts,
      method,
      threshold,
    });
    return response.data;
  } catch (error) {
    console.error('[Check Plagiarism] Error:', error);
    throw error;
  }
};

/**
 * Compare two texts for similarity
 * 
 * @param {Object} params - Comparison parameters
 * @param {string} params.text1 - First text
 * @param {string} params.text2 - Second text
 * @param {string} [params.method='tfidf'] - Comparison method (tfidf|semantic)
 * @returns {Promise<Object>} Similarity score and details
 * 
 * @example
 * const similarity = await compareTexts({
 *   text1: 'First document...',
 *   text2: 'Second document...',
 *   method: 'semantic'
 * });
 */
export const compareTexts = async ({ text1, text2, method = 'tfidf' }) => {
  try {
    // Use plagiarism check with single reference
    const response = await checkPlagiarism({
      text: text1,
      reference_texts: [text2],
      method,
    });
    
    return {
      similarity_score: response.similarity_scores?.[0] || 0,
      method: response.method,
      details: response,
    };
  } catch (error) {
    console.error('[Compare Texts] Error:', error);
    throw error;
  }
};

/**
 * Batch plagiarism check - Check multiple texts
 * 
 * @param {Array<Object>} checkRequests - Array of check request objects
 * @returns {Promise<Object>} Batch check results
 * 
 * @example
 * const results = await batchCheckPlagiarism([
 *   {
 *     text: 'Essay 1...',
 *     reference_texts: ['Reference 1...'],
 *     method: 'tfidf'
 *   },
 *   {
 *     text: 'Essay 2...',
 *     reference_texts: ['Reference 2...'],
 *     method: 'semantic'
 *   }
 * ]);
 */
export const batchCheckPlagiarism = async (checkRequests) => {
  try {
    // Execute all checks in parallel
    const promises = checkRequests.map(request => 
      checkPlagiarism(request)
    );
    
    const results = await Promise.allSettled(promises);
    
    // Process results
    const batchResults = results.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
    
    return {
      success: true,
      total: checkRequests.length,
      results: batchResults,
    };
  } catch (error) {
    console.error('[Batch Check Plagiarism] Error:', error);
    throw error;
  }
};

/**
 * Get plagiarism statistics from check result
 * 
 * @param {Object} checkResult - Result from checkPlagiarism
 * @returns {Object} Statistical summary
 * 
 * @example
 * const result = await checkPlagiarism({...});
 * const stats = getPlagiarismStats(result);
 */
export const getPlagiarismStats = (checkResult) => {
  if (!checkResult || !checkResult.similarity_scores) {
    return {
      average_similarity: 0,
      max_similarity: 0,
      min_similarity: 0,
      is_plagiarized: false,
    };
  }
  
  const scores = checkResult.similarity_scores;
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  
  return {
    average_similarity: average,
    max_similarity: max,
    min_similarity: min,
    is_plagiarized: checkResult.is_plagiarized,
    total_references: scores.length,
    method: checkResult.method,
    threshold: checkResult.threshold,
  };
};