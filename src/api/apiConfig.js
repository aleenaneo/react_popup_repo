/**
 * API Configuration System
 * Maps environment modes to base URLs and provides safe access to initial data
 */

const API_BASE_URLS = {
  production: 'https://your-production-api.com',
  test: 'https://your-test-api.com',
  development: 'http://127.0.0.1:8000',
  local: 'http://127.0.0.1:8000'
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
      mode: 'development',
      programId: 1552
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
 * Gets the program ID from initial data
 * @returns {number} Program ID
 */
export const getProgramId = () => {
  const { programId } = getInitialData();
  return programId || 1552;
};

/**
 * Gets the full API endpoint URL
 * @param {string} path - API path (e.g., '/check_zipcode')
 * @returns {string} Full URL
 */
export const getApiUrl = (path) => {
  // Use the global API_BASE_URL if available, otherwise use the configured base URL
  const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : getApiBaseUrl();
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${normalizedPath}`;
  
  // Log the API URL being used for debugging
  console.log(`API Request: ${fullUrl}`);
  
  return fullUrl;
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

/**
 * Gets environment-specific API configuration
 * @returns {Object} API configuration
 */
export const getApiConfig = () => {
  const { mode } = getInitialData();
  
  const config = {
    production: {
      baseUrl: 'https://your-production-api.com',
      timeout: 10000
    },
    test: {
      baseUrl: 'https://your-test-api.com',
      timeout: 10000
    },
    development: {
      baseUrl: 'http://127.0.0.1:8000',
      timeout: 5000
    },
    local: {
      baseUrl: 'http://127.0.0.1:8000',
      timeout: 5000
    }
  };
  
  return config[mode] || config.development;
};

export default {
  getInitialData,
  getApiBaseUrl,
  getApiUrl,
  getAuthHeaders,
  getProgramId,
  getApiConfig
};
