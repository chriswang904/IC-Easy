/**
 * Literature/Papers API Module
 * 
 * This module provides functions to interact with the literature endpoints
 * of the backend API, including search, lookup, and reference formatting.
 * 
 * @module api/papers
 */

import apiClient from './client';

/**
 * Search for academic literature
 */
export const searchLiterature = async ({ 
  keyword, 
  limit = 10, 
  source = 'crossref', 
  sort_by = 'relevance', 
  filters = null 
}) => {
  try {
    if (source === 'all') {
      const response = await apiClient.post('/api/literature/search-all', {
        keyword,
        limit,
        source: 'all',  
        sort_by,        
        filters         
      });
      return response.data;
    } else {
      const response = await apiClient.post('/api/literature/search', {
        keyword,
        limit,
        source,
        sort_by,
        filters 
      });
      return response.data;
    }
  } catch (error) {
    console.error('[Search Literature] Error:', error);
    throw error;
  }
};

/**
 * Get literature by DOI
 * 
 * @param {string} doi - Digital Object Identifier
 * @returns {Promise<Object>} Literature details
 * 
 * @example
 * const paper = await getLiteratureByDOI('10.1038/nature12373');
 */
export const getLiteratureByDOI = async (doi) => {
  try {
    // URL encode the DOI to handle special characters
    const encodedDOI = encodeURIComponent(doi);
    const response = await apiClient.get(`/api/literature/doi/${encodedDOI}`);
    return response.data;
  } catch (error) {
    console.error('[Get Literature by DOI] Error:', error);
    throw error;
  }
};

/**
 * Get paper by arXiv ID
 * 
 * @param {string} arxivId - arXiv identifier (e.g., '2103.14030' or 'cs.AI/2103.14030')
 * @returns {Promise<Object>} Paper details
 * 
 * @example
 * const paper = await getPaperByArxiv('2103.14030');
 */
export const getPaperByArxiv = async (arxivId) => {
  try {
    // URL encode the arXiv ID to handle special characters
    const encodedId = encodeURIComponent(arxivId);
    const response = await apiClient.get(`/api/literature/arxiv/${encodedId}`);
    return response.data;
  } catch (error) {
    console.error('[Get Paper by arXiv] Error:', error);
    throw error;
  }
};

/**
 * Get work by OpenAlex ID
 * 
 * @param {string} openalexId - OpenAlex identifier (e.g., 'W2741809807')
 * @returns {Promise<Object>} Work details
 * 
 * @example
 * const work = await getWorkByOpenAlex('W2741809807');
 */
export const getWorkByOpenAlex = async (openalexId) => {
  try {
    const response = await apiClient.get(`/api/literature/openalex/${openalexId}`);
    return response.data;
  } catch (error) {
    console.error('[Get Work by OpenAlex] Error:', error);
    throw error;
  }
};

/**
 * Format a literature reference
 * 
 * @param {Object} params - Formatting parameters
 * @param {Object} params.literature - Literature data object
 * @param {string} [params.format='apa'] - Citation format (apa|ieee|mla)
 * @returns {Promise<Object>} Formatted reference
 * 
 * @example
 * const formatted = await formatReference({
 *   literature: {
 *     title: 'Example Paper',
 *     authors: ['John Doe', 'Jane Smith'],
 *     year: 2023,
 *     doi: '10.1234/example'
 *   },
 *   format: 'apa'
 * });
 */
export const formatReference = async ({ literature, format = 'apa' }) => {
  try {
    const response = await apiClient.post('/api/literature/format-reference', {
      literature,
      format,
    });
    return response.data;
  } catch (error) {
    console.error('[Format Reference] Error:', error);
    throw error;
  }
};

/**
 * Batch search - Search multiple keywords at once
 */
export const batchSearch = async (keywords, options = {}) => {
  try {
    const { limit = 10, source = 'crossref' } = options;
    
    // Execute all searches in parallel
    const promises = keywords.map(keyword => 
      searchLiterature({ keyword, limit, source })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Process results
    const batchResults = results.map((result, index) => ({
      keyword: keywords[index],
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
    
    return {
      success: true,
      total: keywords.length,
      results: batchResults,
    };
  } catch (error) {
    console.error('[Batch Search] Error:', error);
    throw error;
  }
};

/**
 * Get recommended papers based on a paper
 * (This is a placeholder - implement based on your backend logic)
 * 
 * @param {string} paperId - Paper identifier
 * @param {number} [limit=5] - Number of recommendations
 * @returns {Promise<Object>} Recommended papers
 */
export const getRecommendations = async (paperId, limit = 5) => {
  try {
    // This is a placeholder implementation
    // You may need to implement this endpoint in your backend
    console.warn('[Get Recommendations] This feature is not yet implemented');
    return {
      success: false,
      message: 'Recommendations feature not yet implemented',
    };
  } catch (error) {
    console.error('[Get Recommendations] Error:', error);
    throw error;
  }
};

export const getLatest = async ({ source = 'arxiv', topicKey, limit = 3 }) => {
  const { data } = await apiClient.get('/api/literature/latest', {
    params: { source, topic_key: topicKey, limit },
  });
  return data;
};