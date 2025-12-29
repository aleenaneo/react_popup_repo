/**
 * GraphQL Service
 * Handles all GraphQL API calls for product data
 */

import { getInitialData, getApiUrl, getGraphQlEndpoint } from './apiConfig';

/**
 * Executes a GraphQL query against the BigCommerce GraphQL API
 * @param {string} query - GraphQL query string
 * @param {Object} variables - GraphQL variables object
 * @returns {Promise<Object>} GraphQL response
 */
export const executeGraphQLQuery = async (query, variables = {}) => {
  const { token, endpoint } = getInitialData();
  
  const requestUrl = getGraphQlEndpoint(); // Use the GraphQL endpoint from API config
  
  // Log the request URL for debugging
  console.log(`GraphQL Request: ${requestUrl}`);
  
  try {
    // For development mode, we might not have a token from BigCommerce
    // so we don't include the Authorization header for proxy requests
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Only add Authorization header if we have a token and we're not using the proxy
    if (token && !requestUrl.includes('/api/proxy-graphql')) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(`GraphQL Error: ${result.errors[0]?.message || 'Unknown error'}`);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL query failed:', error);
    throw error;
  }
};

/**
 * Fetches product details by SKU
 * @param {string} sku - Product SKU
 * @returns {Promise<Object>} Product details
 */
export const fetchProductBySku = async (sku, currencyCode) => {
  // Use currency code from config if not provided
  const configCurrencyCode = getInitialData().currency_code || 'USD';
  const finalCurrencyCode = currencyCode || configCurrencyCode;
  
  const query = `query productDetails {
    site {
      currency(currencyCode: ${finalCurrencyCode}) {
            name
            display {
              symbol
            }
    }
      product(sku: "${sku}") {
        addToCartUrl
        images {
          edges {
            node {
              urlOriginal
              altText
            }
          }
        }
        name
        path
        prices {
          salePrice {
            currencyCode
            value
          }
          basePrice {
            currencyCode
            value
          }
        }
        id
        sku
        description
        relatedProducts {
          edges {
            node {
              id
              name
              path
              sku
              prices {
                salePrice {
                  value
                  currencyCode
                }
                basePrice {
                  value
                  currencyCode
                }
              }
              images {
                edges {
                  node {
                    urlOriginal
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

  try {
    const data = await executeGraphQLQuery(query);
    return data.site.product;
  } catch (error) {
    console.error('Failed to fetch product by SKU:', error);
    throw error;
  }
};

/**
 * Fetches related products by SKU
 * @param {string} sku - Product SKU
 * @returns {Promise<Array>} Related products
 */
export const fetchRelatedProductsBySku = async (sku, currencyCode) => {
  // Use currency code from config if not provided
  const configCurrencyCode = getInitialData().currency_code || 'USD';
  const finalCurrencyCode = currencyCode || configCurrencyCode;
  
  const product = await fetchProductBySku(sku, finalCurrencyCode);
  return product?.relatedProducts?.edges?.map(edge => edge.node) || [];
};

export default {
  executeGraphQLQuery,
  fetchProductBySku,
  fetchRelatedProductsBySku
};