/**
 * API Configuration System
 * Maps environment modes to base URLs and provides safe access to initial data
 */

const API_BASE_URLS = {
  production: 'https://installer-net.loca.lt',
  test: 'https://your-test-api.com',
  development: 'https://installer--net.loca.lt',
  local: 'https://installer--net.loca.lt'
};

// GraphQL API endpoints per environment
const GRAPHQL_ENDPOINTS = {
  production: 'https://store-5o7xzmxoo0.mybigcommerce.com/graphql',
  test: 'https://store-5o7xzmxoo0.mybigcommerce.com/graphql',
  development: '/graphql', // Use proxy path during development
  local: '/graphql' // Use proxy path during local development
};

/**
 * Safely retrieves initial data from window object
 * @returns {Object} Initial data with defaults
 */
export const getInitialData = () => {
  if (typeof window === 'undefined' || !window.cm_nb_ra_in_config) {
    throw new Error('window.cm_nb_ra_in_config not found. Please ensure the configuration is set in index.html before loading the app.');
  }
  return window.cm_nb_ra_in_config;
};

/**
 * Gets the GraphQL endpoint based on current mode
 * @returns {string} GraphQL endpoint URL
 */
export const getGraphQlEndpoint = () => {
  const { mode, endpoint } = getInitialData();
  
  // Check if we have a specific GraphQL endpoint for this mode
  if (GRAPHQL_ENDPOINTS[mode]) {
    return GRAPHQL_ENDPOINTS[mode];
  }
  
  // If endpoint is already a full URL, return as is
  if (endpoint && endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Fallback: construct with API base URL
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
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

/**
 * Gets Google Maps API key from initial data (injected in theme) or Vite env var
 * @returns {string|null}
 */
export const getGoogleMapsApiKey = () => {
  try {
    const { googleMapsApiKey } = getInitialData();
    if (googleMapsApiKey) return googleMapsApiKey;
  } catch (e) {
    // window config not present
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  console.warn('Google Maps API key not found. Google Maps will be disabled.');
  return null;
};

export default {
  getInitialData,
  getApiBaseUrl,
  getApiUrl,
  getAuthHeaders,
  getProgramId,
  getApiConfig,
  getGraphQlEndpoint,
  getGoogleMapsApiKey
};
