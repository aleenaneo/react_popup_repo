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
    const response = await fetch(getApiUrl('/api/installers/by-zipcode'), {
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
      locations: installers.map(installer => {
        // Normalize distance values: if missing use '0 miles', if number append ' miles',
        // if string without units append ' miles'
        const rawDistance = installer.distance;
        let distance = '0 miles';
        if (rawDistance != null && rawDistance !== '') {
          if (typeof rawDistance === 'number') {
            distance = `${rawDistance} miles`;
          } else if (typeof rawDistance === 'string') {
            distance = /\d/.test(rawDistance) ? (/mile/i.test(rawDistance) ? rawDistance : `${rawDistance} miles`) : rawDistance;
          } else {
            distance = String(rawDistance);
          }
        }

        return {
          lat: parseFloat(installer.latitude || installer.lat || 0),
          lng: parseFloat(installer.longitude || installer.lng || installer.lon || 0),
          member_id: installer.memberId || installer.member_id || 0,
          name: installer.companyName || installer.name || 'Unknown Company',
          distance,
          city: installer.city || 'Unknown City'
        };
      })
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
    const response = await fetch(getApiUrl('/api/vehicles/years'), {
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
    console.log('Raw vehicle years data from API:', data);
    
    // Process the data to ensure it's in the correct format
    let processedData = [];
    if (Array.isArray(data)) {
      processedData = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.years)) {
      processedData = data.years;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      processedData = data.data;
    }
    
    console.log('Processed vehicle years data:', processedData);
    return processedData;
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
    console.log(`Fetching vehicle makes for year: ${year}`);
    const response = await fetch(getApiUrl(`/api/vehicles/makes?year=${year}`), {
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
    console.log(`Raw vehicle makes for year ${year}:`, data);
    console.log(`Type of raw data:`, typeof data);
    console.log(`Is raw data an array:`, Array.isArray(data));
    
    // Process the data to ensure it's in the correct format
    let processedData = [];
    if (Array.isArray(data)) {
      processedData = data;
      console.log(`Direct array data, length:`, data.length);
    } else if (data && typeof data === 'object' && Array.isArray(data.makes)) {
      processedData = data.makes;
      console.log(`Data has makes array, length:`, data.makes.length);
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      processedData = data.data;
      console.log(`Data has data array, length:`, data.data.length);
    } else {
      console.log(`Unexpected data format, using empty array`);
    }
    
    console.log(`Processed vehicle makes for year ${year}:`, processedData);
    console.log(`First few processed items:`, processedData.slice(0, 3));
    return processedData;
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
    console.log(`Fetching vehicle models for year: ${year} and make: ${make}`);
    // The API expects makeID instead of make name
    // We need to pass the make ID, not the make name
    const response = await fetch(getApiUrl(`/api/vehicles/models?year=${year}&makeID=${make}`), {
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
    console.log(`Raw vehicle models for year ${year} and make ${make}:`, data);
    console.log(`Type of raw data:`, typeof data);
    console.log(`Is raw data an array:`, Array.isArray(data));
    
    // Process the data to ensure it's in the correct format
    let processedData = [];
    if (Array.isArray(data)) {
      processedData = data;
      console.log(`Direct array data, length:`, data.length);
    } else if (data && typeof data === 'object' && Array.isArray(data.models)) {
      processedData = data.models;
      console.log(`Data has models array, length:`, data.models.length);
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      processedData = data.data;
      console.log(`Data has data array, length:`, data.data.length);
    } else {
      console.log(`Unexpected data format, using empty array`);
    }
    
    console.log(`Processed vehicle models for year ${year} and make ${make}:`, processedData);
    console.log(`First few processed items:`, processedData.slice(0, 3));
    return processedData;
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
    const response = await fetch(getApiUrl(`/api/vehicles/types?model=${model}`), {
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
    // Create URL parameters for options
    const params = new URLSearchParams();
    params.append('action', 'add');
    params.append('product_id', cartData.productId);
    
    // Add each option to the URL parameters if options exist
    if (cartData.options && Object.keys(cartData.options).length > 0) {
      for (const [key, value] of Object.entries(cartData.options)) {
        params.append(`attribute[${key}]`, value || '');
      }
    }
    
    // Add installation ID if provided
    if (cartData.installationId) {
      params.append('installation_id', cartData.installationId);
    }
    
    // Add metadata if provided
    if (cartData.metadata) {
      for (const [key, value] of Object.entries(cartData.metadata)) {
        params.append(key, value || '');
      }
    }
    
    // Construct the cart URL
    const cartUrl = `/cart.php?${params.toString()}`;
    
    // Make the request to add to cart
    const response = await fetch(getApiUrl(cartUrl), {
      method: 'POST',
      headers: getAuthHeaders(),
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

/**
 * Add products to cart with product options
 * @param {Object} product - Product object with id and options
 * @param {Object} options - Selected product options
 * @returns {Promise<Object>} Cart response
 */
export const addToCartWithOptions = async (productId, options) => {
  if (useMockAPI()) {
    // Mock implementation for testing
    console.log('Mock add to cart with options:', { productId, options });
    return { success: true, cartId: 'mock-cart-id' };
  }

  try {
    // Construct the URL with product options
    const params = new URLSearchParams();
    params.append('action', 'add');
    params.append('product_id', productId);
    
    // Add each option to the URL parameters
    for (const [key, value] of Object.entries(options)) {
      params.append(`attribute[${key}]`, value);
    }
    
    // Construct the cart URL
    const cartUrl = `/cart.php?${params.toString()}`;
    
    // Make the request to add to cart
    const response = await fetch(getApiUrl(cartUrl), {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Add to cart with options failed:', error);
    throw error;
  }
};

/**
 * Add multiple products to cart with options
 * @param {Array} productsWithOpts - Array of objects with productId and options
 * @returns {Promise<Object>} Cart response
 */
export const addMultipleToCartWithOptions = async (productsWithOpts) => {
  if (useMockAPI()) {
    // Mock implementation for testing
    console.log('Mock add multiple to cart with options:', productsWithOpts);
    return { success: true, cartId: 'mock-cart-id' };
  }

  try {
    const results = [];
    for (const item of productsWithOpts) {
      const result = await addToCartWithOptions(item.productId, item.options);
      results.push(result);
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Add multiple to cart with options failed:', error);
    throw error;
  }
};

/**
 * Add multiple products to cart
 * @param {Array} cartDataArray - Array of cart data objects
 * @returns {Promise<Object>} Cart response
 */
export const addMultipleToCart = async (cartDataArray) => {
  if (useMockAPI()) {
    console.log('Mock add multiple to cart:', cartDataArray);
    return { success: true, cartId: 'mock-cart-id' };
  }

  try {
    const results = [];
    for (const cartData of cartDataArray) {
      const result = await addToCart(cartData);
      results.push(result);
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Add multiple to cart failed:', error);
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
