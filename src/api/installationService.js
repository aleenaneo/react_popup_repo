/**
 * Installation Service
 * Handles all API calls for the installation flow
 */

import { getApiUrl, getAuthHeaders } from './apiConfig';
import MockAPIService from './mockApiService';

/**
 * Check if mock mode is enabled
 */
const useMockAPI = () => {
  return typeof window !== 'undefined' && window.__USE_MOCK_API__ === true;
};

/**
 * Check if zipcode is serviceable
 * @param {string} zipcode - 6 digit zipcode
 * @returns {Promise<Object>} Response with locations array
 */
export const checkZipcode = async (zipcode) => {
  if (useMockAPI()) {
    return MockAPIService.checkZipcode(zipcode);
  }

  try {
    const response = await fetch(getApiUrl('/check_zipcode'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ zipcode })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Zipcode check failed:', error);
    throw error;
  }
};

/**
 * Get available years for vehicles
 * @returns {Promise<Array>} Array of years
 */
export const getYears = async () => {
  if (useMockAPI()) {
    return MockAPIService.getYears();
  }

  try {
    const response = await fetch(getApiUrl('/get-year'), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get years failed:', error);
    throw error;
  }
};

/**
 * Get vehicle makes for a specific year
 * @param {number} year - Selected year
 * @returns {Promise<Array>} Array of makes
 */
export const getMakes = async (year) => {
  if (useMockAPI()) {
    return MockAPIService.getMakes(year);
  }

  try {
    const response = await fetch(getApiUrl(`/get-make?year=${year}`), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get makes failed:', error);
    throw error;
  }
};

/**
 * Get vehicle models for a specific year and make
 * @param {number} year - Selected year
 * @param {string} make - Selected make
 * @returns {Promise<Array>} Array of models
 */
export const getModels = async (year, make) => {
  if (useMockAPI()) {
    return MockAPIService.getModels(year, make);
  }

  try {
    const response = await fetch(getApiUrl(`/get-model?year=${year}&make=${make}`), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get models failed:', error);
    throw error;
  }
};

/**
 * Get vehicle types for a specific model
 * @param {string} model - Selected model
 * @returns {Promise<Array>} Array of types
 */
export const getTypes = async (model) => {
  if (useMockAPI()) {
    return MockAPIService.getTypes(model);
  }

  try {
    const response = await fetch(getApiUrl(`/get-type?model=${model}`), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get types failed:', error);
    throw error;
  }
};

/**
 * Add products to cart with installation metadata
 * @param {Object} cartData - Cart data including products and metadata
 * @returns {Promise<Object>} Cart response
 */
export const addToCart = async (cartData) => {
  if (useMockAPI()) {
    return MockAPIService.addToCart(cartData);
  }

  try {
    const response = await fetch(getApiUrl('/cart/add'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cartData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Add to cart failed:', error);
    throw error;
  }
};

export default {
  checkZipcode,
  getYears,
  getMakes,
  getModels,
  getTypes,
  addToCart
};
