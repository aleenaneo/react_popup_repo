/**
 * Mock API Server for Testing
 * This file provides mock implementations of all API endpoints
 * Use this for local development and testing
 */

// Mock data
const MOCK_LOCATIONS = [
  { lat: "28.6139", lng: "77.2090", member_id: 1001, name: "Downtown Auto Center", address: "123 Main St, New Delhi" },
  { lat: "28.7041", lng: "77.1025", member_id: 1002, name: "North Side Garage", address: "456 North Ave, New Delhi" },
  { lat: "28.5355", lng: "77.3910", member_id: 1003, name: "East End Customs", address: "789 East Rd, Noida" }
];

const MOCK_YEARS = ["2020", "2021", "2022", "2023", "2024"];

const MOCK_MAKES = {
  "2023": ["Honda", "Toyota", "Ford", "Chevrolet", "BMW"],
  "2024": ["Honda", "Toyota", "Ford", "Tesla", "Hyundai"]
};

const MOCK_MODELS = {
  "Honda": ["Civic", "Accord", "CR-V", "Pilot"],
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"],
  "Ford": ["F-150", "Mustang", "Explorer", "Escape"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X"]
};

const MOCK_TYPES = {
  "Civic": ["Sedan", "Coupe", "Hatchback"],
  "Accord": ["Sedan", "Hybrid"],
  "CR-V": ["SUV", "Hybrid"],
  "Camry": ["Sedan", "Hybrid"]
};

/**
 * Mock API Service
 * Replace the real API calls with these for testing
 */
export const MockAPIService = {
  /**
   * Check zipcode - simulates API delay
   */
  checkZipcode: async (zipcode) => {
    await delay(1000);
    
    // Simulate invalid zipcode
    if (zipcode === "000000") {
      return { locations: [] };
    }
    
    return { locations: MOCK_LOCATIONS };
  },

  /**
   * Get vehicle years
   */
  getYears: async () => {
    await delay(500);
    return MOCK_YEARS;
  },

  /**
   * Get vehicle makes for a year
   */
  getMakes: async (year) => {
    await delay(500);
    return MOCK_MAKES[year] || MOCK_MAKES["2023"];
  },

  /**
   * Get vehicle models for a make
   */
  getModels: async (year, make) => {
    await delay(500);
    return MOCK_MODELS[make] || ["Model 1", "Model 2", "Model 3"];
  },

  /**
   * Get vehicle types for a model
   */
  getTypes: async (model) => {
    await delay(500);
    return MOCK_TYPES[model] || ["Type 1", "Type 2"];
  },

  /**
   * Add to cart
   */
  addToCart: async (cartData) => {
    await delay(1000);
    console.log("Mock Add to Cart:", cartData);
    return {
      success: true,
      cartId: "mock-cart-" + Date.now(),
      message: "Products added successfully"
    };
  }
};

/**
 * Utility function to simulate network delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enable mock mode
 * Call this function to use mock data instead of real API
 */
export const enableMockMode = () => {
  console.log("🧪 Mock API Mode Enabled");
  
  // Override the real API service
  if (typeof window !== 'undefined') {
    window.__USE_MOCK_API__ = true;
  }
};

/**
 * Disable mock mode
 */
export const disableMockMode = () => {
  console.log("🔌 Real API Mode Enabled");
  
  if (typeof window !== 'undefined') {
    window.__USE_MOCK_API__ = false;
  }
};

export default MockAPIService;
