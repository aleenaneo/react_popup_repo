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
  console.log(`GraphQL Query:`, query);
  console.log(`GraphQL Variables:`, variables);
  
  try {
    // For development mode, we might not have a token from BigCommerce
    // so we don't include the Authorization header for proxy requests
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add Authorization header for BigCommerce GraphQL API
    // In development mode, we're using a proxy to forward requests to BigCommerce
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`GraphQL Request Headers:`, headers);
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query,
        variables
      })
    });
    console.log(`GraphQL Response Status:`, response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`GraphQL Response Data:`, result);
    
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
              entityId
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
                productOptions {
        edges {
          node {
            displayName
            isVariantOption
            ... on MultiLineTextFieldOption {
              defaultValue
              entityId
              displayName
            }
            ... on TextFieldOption {
              displayName
              entityId
            }
          }
        }
      }
            }
          }
        }
      }
    }
  }`;

  console.log(`Fetching product by SKU:`, sku, `with currency code:`, finalCurrencyCode);
  try {
    const data = await executeGraphQLQuery(query);
    console.log(`Product data fetched:`, data.site.product);
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
  
  console.log(`Fetching related products for SKU:`, sku, `with currency code:`, finalCurrencyCode);
  const product = await fetchProductBySku(sku, finalCurrencyCode);
  const relatedProducts = product?.relatedProducts?.edges?.map(edge => edge.node) || [];
  console.log(`Related products fetched:`, relatedProducts);
  return relatedProducts;
};

export default {
  executeGraphQLQuery,
  fetchProductBySku,
  fetchRelatedProductsBySku
};