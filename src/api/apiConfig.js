/**
 * API Configuration System
 * Maps environment modes to base URLs and provides safe access to initial data
 */

const API_BASE_URLS = {
  production: 'http://127.0.0.1:8',
  test: 'http://127.0.0.1:8',
  development: 'http://127.0.0.1:8',
  local: 'http://127.0.0.1:8'
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
  // Use the global API_BASE_URL if available, otherwise use the configured base URL
  const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : getApiBaseUrl();
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
