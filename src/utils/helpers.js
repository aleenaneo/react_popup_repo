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

export default {
  isValidZipcode,
  getDateOffset,
  formatDate,
  getAvailableDates,
  TIME_SLOTS,
  lockScroll,
  unlockScroll,
  detectPageType
};
