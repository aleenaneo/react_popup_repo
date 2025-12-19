/**
 * Mock API Server for Testing
 * This file provides mock implementations of all API endpoints
 * Use this for local development and testing
 */

// Mock data for US locations
const MOCK_LOCATIONS = [
  { lat: "40.7128", lng: "-74.0060", member_id: 1001, name: "Downtown Auto Center", address: "123 Main St, New York, NY", city: "New York" },
  { lat: "40.7589", lng: "-73.9851", member_id: 1002, name: "Times Square Garage", address: "1 Times Square, New York, NY", city: "New York" },
  { lat: "40.6892", lng: "-74.0445", member_id: 1003, name: "Brooklyn Service Center", address: "123 Brooklyn Ave, Brooklyn, NY", city: "Brooklyn" },
  { lat: "34.0522", lng: "-118.2437", member_id: 1004, name: "LA Auto Specialists", address: "456 Hollywood Blvd, Los Angeles, CA", city: "Los Angeles" },
  { lat: "41.8781", lng: "-87.6298", member_id: 1005, name: "Chicago Windy City Repairs", address: "789 Michigan Ave, Chicago, IL", city: "Chicago" }
];

// Mock data for new API format with US locations
const MOCK_INSTALLERS = [
  { latitude: "40.7128", longitude: "-74.0060", memberId: 1001, companyName: "Downtown Auto Center", distance: "2.5 miles", city: "New York" },
  { latitude: "40.7589", longitude: "-73.9851", memberId: 1002, companyName: "Times Square Garage", distance: "5.2 miles", city: "New York" },
  { latitude: "40.6892", longitude: "-74.0445", memberId: 1003, companyName: "Brooklyn Service Center", distance: "3.8 miles", city: "Brooklyn" },
  { latitude: "34.0522", lon: "-118.2437", memberId: 1004, companyName: "LA Auto Specialists", distance: "1.2 miles", city: "Los Angeles" }, // Using 'lon' instead of 'longitude'
  { latitude: "41.8781", longitude: "-87.6298", memberId: 1005, companyName: "Chicago Windy City Repairs", distance: "0.8 miles", city: "Chicago" }
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
    if (zipcode === "00000") {
      return { locations: [] };
    }
    
    return { locations: MOCK_LOCATIONS };
  },

  /**
   * Check zipcode with new API format - simulates API delay
   */
  checkZipcodeByAPI: async (zipcode) => {
    await delay(1000);
    
    // Simulate invalid zipcode
    if (zipcode === "00000") {
      return [];
    }
    
    // Transform to match expected format
    return {
      locations: MOCK_INSTALLERS.map(installer => ({
        lat: parseFloat(installer.latitude),
        lng: parseFloat(installer.longitude || installer.lon || 0),
        member_id: installer.memberId,
        name: installer.companyName,
        distance: installer.distance,
        city: installer.city
      }))
    };
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
