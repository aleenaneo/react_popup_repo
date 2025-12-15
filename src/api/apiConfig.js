/**
 * API Configuration System
 * Maps environment modes to base URLs and provides safe access to initial data
 */

const API_BASE_URLS = {
  production: 'https://api.production.example.com',
  test: 'https://api.test.example.com',
  development: 'https://api.dev.example.com',
  local: 'http://localhost:3000'
};

/**
 * Safely retrieves initial data from window object
 * @returns {Object} Initial data with defaults
 */
export const getInitialData = () => {
  if (typeof window === 'undefined' || !window.initialData) {
    console.warn('window.initialData not found, using defaults');
    return {
      token: '',
      endpoint: '/graphql',
      product_id_th: '',
      currency_code: 'USD',
      mode: 'development'
    };
  }
  return window.initialData;
};

/**
 * Gets the API base URL based on current mode
 * @returns {string} Base URL for API calls
 */
export const getApiBaseUrl = () => {
  const { mode } = getInitialData();
  
  if (!API_BASE_URLS[mode]) {
    console.error(`Invalid mode: ${mode}, falling back to development`);
    return API_BASE_URLS.development;
  }
  
  return API_BASE_URLS[mode];
};

/**
 * Gets the full API endpoint URL
 * @param {string} path - API path (e.g., '/check_zipcode')
 * @returns {string} Full URL
 */
export const getApiUrl = (path) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};

/**
 * Gets authorization headers
 * @returns {Object} Headers object
 */
export const getAuthHeaders = () => {
  const { token } = getInitialData();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export default {
  getInitialData,
  getApiBaseUrl,
  getApiUrl,
  getAuthHeaders
};
