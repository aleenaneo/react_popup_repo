import React, { useState } from 'react';
import './ProductBox.css';

const ProductBox = ({ product, installationProduct, onToggleInstallation }) => {
  const [isInstallationAdded, setIsInstallationAdded] = useState(false);

  const handleToggle = () => {
    const newState = !isInstallationAdded;
    setIsInstallationAdded(newState);
    onToggleInstallation(newState);
  };

  if (!product) return null;

  // Use installation product details if available, otherwise fallback (though this appears to be an installation-specific card)
  const displayPrice = installationProduct ? installationProduct.price : product.price;
  const currency = installationProduct ? installationProduct.currency : product.currency;

  return (
    <div className={`product-box ${isInstallationAdded ? 'selected' : ''}`}>
      {/* Icon Section */}
      <div className="product-icon-wrapper">
        <div className="product-icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>

      {/* Details Section */}
      <div className="product-details">
        <h3 className="product-title">Professional installation</h3>
        <p className="product-subtitle">(Includes hardwire kit)</p>
      </div>

      {/* Price & Action Section */}
      <div className="product-actions">
        <div className="product-price">
            {currency}{displayPrice}
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
