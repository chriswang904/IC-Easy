// api/index.js 

export { default as apiClient, checkApiHealth, getApiInfo } from './client';

export * from './auth';
export * from './history';
export * from './papers';


export {
  checkTextPlagiarism,
  checkFilePlagiarism,
  extractTextFromFile,
  checkPlagiarism,
  compareTexts,
  batchCheckPlagiarism,
  getPlagiarismStats,
} from './plagiarism';

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  DEFAULT_LIMIT: 10,
  SOURCES: ['crossref', 'arxiv', 'openalex'],
  FORMATS: ['apa', 'ieee', 'mla'],
  PLAGIARISM_METHODS: ['longformer'], 
};

export {
  register,
  login,
  logout,
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
} from './auth';

export {
  getSearchHistory,
  getTrendingKeywords,
  advancedSearch,
} from './history';

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