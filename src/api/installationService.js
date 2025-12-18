/**
 * Installation Service
 * Handles all API calls for the installation flow
 */

import { getApiUrl, getAuthHeaders, getProgramId, getApiConfig } from './apiConfig';
import MockAPIService from './mockApiService';

/**
 * Check if mock mode is enabled
 */
const useMockAPI = () => {
  return typeof window !== 'undefined' && window.__USE_MOCK_API__ === true;
};

/**
 * Check zipcode with new API endpoint
 * @param {string} zipcode - 5 digit zipcode
 * @returns {Promise<Object>} Response with locations array containing company details
 */
export const checkZipcodeByAPI = async (zipcode) => {
  if (useMockAPI()) {
    return MockAPIService.checkZipcodeByAPI(zipcode);
  }

  try {
    const response = await fetch('/api/installers/by-zipcode', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        zipcode: zipcode,
        programId: getProgramId()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Handle different response formats
    let installers = [];
    
    // If data is already an array of installers
    if (Array.isArray(data)) {
      installers = data;
    }
    // If data is an object with a locations or installers property
    else if (data && typeof data === 'object') {
      if (Array.isArray(data.locations)) {
        installers = data.locations;
      } else if (Array.isArray(data.installers)) {
        installers = data.installers;
      } else if (Array.isArray(data.data)) {
        installers = data.data;
      }
    }
    
    // Validate that we have an array of installers
    if (!Array.isArray(installers)) {
      console.error('Invalid API response format. Expected array of installers.');
      throw new Error('Invalid API response format');
    }
    
    // Transform the response to match expected format
    return {
      locations: installers.map(installer => ({
        lat: installer.latitude || installer.lat || 0,
        lng: installer.longitude || installer.lng || 0,
        member_id: installer.memberId || installer.member_id || 0,
        name: installer.companyName || installer.name || 'Unknown Company',
        distance: installer.distance || 'Unknown Distance'
      }))
    };
  } catch (error) {
    console.error('Zipcode check by API failed:', error);
    throw error; // Don't fallback to mock data, let the error propagate
  }
};

/**
 * Check if zipcode is serviceable
 * @param {string} zipcode - 5 digit zipcode
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
    const response = await fetch('/api/vehicles/years', {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Vehicle years data:', data);
    return data;
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
    const response = await fetch(`/api/vehicles/makes?year=${year}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Vehicle makes for year ${year}:`, data);
    return data;
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
    const response = await fetch(`/api/vehicles/models?year=${year}&make=${make}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Vehicle models for year ${year} and make ${make}:`, data);
    return data;
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
    const response = await fetch(`/api/vehicles/types?model=${model}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Vehicle types for model ${model}:`, data);
    return data;
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
  checkZipcodeByAPI,
  getYears,
  getMakes,
  getModels,
  getTypes,
  addToCart
};
