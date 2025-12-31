/**
 * Utility functions for the installation flow
 */

/**
 * Validates a 6-digit zipcode
 * @param {string} zipcode - Zipcode to validate
 * @returns {boolean} True if valid
 */
export const isValidZipcode = (zipcode) => {
  return /^\d{5}$/.test(zipcode);
};

/**
 * Gets date offset by number of days
 * @param {number} days - Number of days to offset
 * @returns {Date} Offset date
 */
export const getDateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Formats date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets available dates starting 8 days from today
 * @param {number} count - Number of dates to generate
 * @returns {Array<string>} Array of formatted dates
 */
export const getAvailableDates = (count = 14) => {
  const dates = [];
  for (let i = 8; i < count + 8; i++) {
    dates.push(formatDate(getDateOffset(i)));
  }
  return dates;
};

/**
 * Time slot options
 */
export const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9 AM - 12 PM)', value: 'Morning' },
  { id: 'afternoon', label: 'Afternoon (12 PM - 3 PM)', value: 'Afternoon' },
  { id: 'late', label: 'Late Afternoon (3 PM - 6 PM)', value: 'Late Afternoon' }
];

/**
 * Locks body scroll
 */
export const lockScroll = () => {
  document.body.style.overflow = 'hidden';
};

/**
 * Unlocks body scroll
 */
export const unlockScroll = () => {
  document.body.style.overflow = '';
};

/**
 * Detects page type from URL or data attributes
 * @returns {string} Page type: 'pdp', 'plp', or 'cart'
 */
export const detectPageType = () => {
  if (window.location.pathname.includes('/cart')) return 'cart';
  if (window.location.pathname.includes('/products')) return 'pdp';
  if (window.location.pathname.includes('/category')) return 'plp';
  return 'pdp'; // default
};

export const createAttributeMapping = (vehicle, appointment, location, zipcode = '') => {
  // Get the mapping configuration from global config
  const mappingConfig = window.cm_nb_ra_in_config?.phf_mapping || {};
  
  // Create a mapping of display names to attribute IDs
  // This should be configured in your BigCommerce product options
  const attributeMapping = {};
  
  // Map vehicle year to the appropriate attribute ID
  if (mappingConfig.year && vehicle?.year) {
    // In a real implementation, you would map the display name to the actual attribute ID
    // For now, we'll use common attribute IDs based on the display name
    if (mappingConfig.year.includes('year')) {
      attributeMapping['375'] = vehicle.year; // Common ID for vehicle year
    }
  }
  
  // Map vehicle make to the appropriate attribute ID
  if (mappingConfig.make && vehicle?.make) {
    if (mappingConfig.make.includes('make')) {
      attributeMapping['376'] = vehicle.make; // Common ID for vehicle make
    }
  }
  
  // Map vehicle model to the appropriate attribute ID
  if (mappingConfig.model && vehicle?.model) {
    if (mappingConfig.model.includes('modal')) {
      attributeMapping['377'] = vehicle.model; // Common ID for vehicle model
    }
  }
  
  // Map installation date to the appropriate attribute ID
  if (mappingConfig.date && appointment?.date) {
    if (mappingConfig.date.includes('date')) {
      attributeMapping['381'] = appointment.date; // Common ID for installation date
    }
  }
  
  // Map time to the appropriate attribute ID
  if (mappingConfig.time && appointment?.time) {
    if (mappingConfig.time.includes('time')) {
      attributeMapping['382'] = appointment.time; // Common ID for time
    }
  }
  
  // Map installer member ID to the appropriate attribute ID
  if (mappingConfig.memberId && (location?.member_id || location?.memberId)) {
    if (mappingConfig.memberId.includes('member')) {
      attributeMapping['384'] = location.member_id || location.memberId; // Common ID for installer member ID
    }
  }
  
  // Map zip code to attribute ID 385 as requested
  if (mappingConfig.zipcode && zipcode) {
    if (mappingConfig.zipcode.includes('zip')) {
      attributeMapping['385'] = zipcode; // ID 385 for zip code
    }
  }
  
  return attributeMapping;
};

/**
 * Generate full cart URL with attributes
 * @param {number} productId - Product ID
 * @param {Object} attributes - Attribute mapping object
 * @returns {string} Cart URL with attributes
 */
export const generateFullCartUrlWithAttributes = (productId, attributes) => {
  const params = new URLSearchParams();
  params.append('action', 'add');
  params.append('product_id', productId);
  
  // Add each attribute to the URL
  for (const [attrId, value] of Object.entries(attributes)) {
    if (value) { // Only add if value exists
      params.append(`attribute[${attrId}]`, value);
    }
  }
  
  return `/cart.php?${params.toString()}`;
};

export default {
  isValidZipcode,
  getDateOffset,
  formatDate,
  getAvailableDates,
  TIME_SLOTS,
  lockScroll,
  unlockScroll,
  detectPageType,
  createAttributeMapping,
  generateFullCartUrlWithAttributes
};
