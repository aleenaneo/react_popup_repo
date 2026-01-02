import React, { useState, useEffect } from 'react';
import { fetchRelatedProductsBySku, fetchProductBySku } from '../../api/graphqlService';
import { getInitialData } from '../../api/apiConfig';
import './ProductBox.css';

const ProductBox = ({ product, installationProduct, onToggleInstallation }) => {
  const [isInstallationAdded, setIsInstallationAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currencyInfo, setCurrencyInfo] = useState(null);
  
  const handleToggle = () => {
    const newState = !isInstallationAdded;
    setIsInstallationAdded(newState);
    onToggleInstallation(newState);
  };

  // Fetch related products and main product to get currency information using GraphQL when the component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      if (product && product.sku) { // assuming product has a sku field
        setLoading(true);
        try {
          const initialData = getInitialData();
          
          // Fetch main product to get currency information
          const mainProduct = await fetchProductBySku(product.sku);
          
          // Get related products from the main product
          const relatedProductsData = mainProduct?.relatedProducts?.edges?.map(edge => edge.node) || [];
          
          const preferredSkus = initialData.phf_product_skus ? initialData.phf_product_skus.split(',') : [];
          
          // Filter related products to find ones that match the preferred SKUs
          let displayProducts = relatedProductsData;
          
          // If we have preferred SKUs, prioritize those
          if (preferredSkus.length > 0) {
            const preferredProducts = relatedProductsData.filter(rp => 
              preferredSkus.some(prefSku => prefSku.trim() === rp.sku)
            );
            
            // If we found preferred products, use the first one; otherwise use all related products
            if (preferredProducts.length > 0) {
              displayProducts = preferredProducts;
            }
          }
          
          setRelatedProducts(displayProducts);
          
          // Store currency information in component state
          if (mainProduct?.__currencyInfo) {
            setCurrencyInfo(mainProduct.__currencyInfo);
          }
          
          console.log('GraphQL Related Products Data:', relatedProductsData); // Log the fetched data
          console.log('Preferred SKUs:', preferredSkus);
          console.log('Filtered display products:', displayProducts);
        } catch (error) {
          console.error('Error fetching related products:', error);
          console.warn('CORS or network error may prevent direct GraphQL calls. Using fallback data.');
          // Fallback to empty array if GraphQL fails
          setRelatedProducts([]);
        } finally {
          setLoading(false);
        }
      } else {
        // If no SKU is provided, use empty array
        setRelatedProducts([]);
      }
    };
    
    fetchProductData();
  }, [product]);

  if (!product) return null;

  // Use the first product from filtered list (either preferred or all related)
  const displayProduct = relatedProducts.length > 0 ? relatedProducts[0] : product;

  // Debug the price values
  console.log('Installation product price:', installationProduct?.price);
  console.log('Related product prices:', displayProduct?.prices);
  console.log('Sale price value:', displayProduct?.prices?.salePrice?.value);
  console.log('Base price value:', displayProduct?.prices?.basePrice?.value);
  console.log('Fallback product price:', product?.price);
  
  // Price display logic: salePrice.value → basePrice.value → fallback product price
  // Currency logic: salePrice.currencyCode → basePrice.currencyCode → fallback currency
  const displayPrice = displayProduct?.prices?.salePrice?.value || 
                      displayProduct?.prices?.basePrice?.value || 
                      displayProduct?.price || 
                      product.price;
  const currencyCode = displayProduct?.prices?.salePrice?.currencyCode || 
                  displayProduct?.prices?.basePrice?.currencyCode || 
                  displayProduct?.currency || 
                  product.currency;
  
  // Use related product details if available, otherwise use main product data
  const productName = displayProduct?.name || product.name;
  const productImage = displayProduct?.images?.edges?.[0]?.node?.urlOriginal || displayProduct?.image || product.image;

  // Get currency symbol from GraphQL response
  // Use the dynamically fetched currency symbol from the main product query
  const currencySymbol = currencyInfo?.display?.symbol || currencyCode;

  return (
    <div className={`product-box ${isInstallationAdded ? 'selected' : ''}`}>
      {/* Icon Section - Use product image if available, otherwise use default SVG */}
      <div className="product-icon-wrapper">
        {productImage ? (
          <img src={productImage} alt={productName} className="product-icon-image" />
        ) : (
          <div className="product-icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="product-details">
        <h3 className="product-title">{loading ? 'Loading...' : productName}</h3>
        <p className="product-subtitle">(Includes hardwire kit)</p>
      </div>

      {/* Price & Action Section - Uses GraphQL base price currency code and value when sale price is null */}
      <div className="product-actions">
        <div className="product-price">
            {/* Price display logic: salePrice.value → basePrice.value → fallback product price */}
            {loading ? 'Loading...' : `${currencySymbol}${displayPrice}`}
        </div>
        <button 
          className={`action-button ${isInstallationAdded ? 'added' : 'add'}`}
          onClick={handleToggle}
        >
          {isInstallationAdded ? 'Remove' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default ProductBox;