/**
 * API Client Configuration
 * 
 * This module sets up the Axios instance with base configuration
 * for communicating with the FastAPI backend.
 * 
 * @module api/client
 */

import axios from 'axios';

/**
 * Base URL for the backend API
 * Can be configured via environment variable or defaults to localhost:8000
 */
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor
 * Logs outgoing requests and adds any necessary headers
 */
apiClient.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
    
    // You can add authentication tokens here if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles responses and errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`[API Response] ${response.config.url}`, {
      status: response.status,
      data: response.data,
      requestId: response.headers['x-request-id'],
      processTime: response.headers['x-process-time'],
    });
    
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      console.error('[API Error Response]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle specific error codes
      switch (error.response.status) {
        case 400:
          console.error('Bad Request:', error.response.data.detail);
          break;
        case 404:
          console.error('Resource Not Found:', error.response.data.detail);
          break;
        case 500:
          console.error('Internal Server Error:', error.response.data.detail);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API No Response]', {
        message: 'No response from server',
        url: error.config?.url,
      });
    } else {
      // Something else happened
      console.error('[API Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Health check function
 * Tests if the backend API is accessible
 * 
 * @returns {Promise<boolean>} True if API is healthy, false otherwise
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    console.log('[Health Check] API is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('[Health Check] API is not accessible:', error.message);
    return false;
  }
};

/**
 * Get API information
 * Fetches detailed API information from the backend
 * 
 * @returns {Promise<Object>} API information object
 */
export const getApiInfo = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('[API Info] Failed to fetch API info:', error);
    throw error;
  }
};

export default apiClient;