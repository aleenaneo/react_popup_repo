/**
 * GraphQL Service
 * Handles all GraphQL API calls for product data
 */

import { getInitialData } from './apiConfig';

/**
 * Executes a GraphQL query against the BigCommerce GraphQL API
 * @param {string} query - GraphQL query string
 * @param {Object} variables - GraphQL variables object
 * @returns {Promise<Object>} GraphQL response
 */
export const executeGraphQLQuery = async (query, variables = {}) => {
  const { token, endpoint } = getInitialData();
  
  // Check if endpoint is a full URL (external) or relative path
  const isExternalEndpoint = endpoint.startsWith('http');
  const requestUrl = endpoint; // Use the actual endpoint URL
  
  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
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
export const fetchProductBySku = async (sku) => {
  const query = `query productDetails {
    site {
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
export const fetchRelatedProductsBySku = async (sku) => {
  const product = await fetchProductBySku(sku);
  return product?.relatedProducts?.edges?.map(edge => edge.node) || [];
};

export default {
  executeGraphQLQuery,
  fetchProductBySku,
  fetchRelatedProductsBySku
};