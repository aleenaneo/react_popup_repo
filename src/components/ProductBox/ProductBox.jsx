import React, { useState } from 'react';
import './ProductBox.css';

const ProductBox = ({ product, installationProduct, onToggleInstallation }) => {
  const [isInstallationAdded, setIsInstallationAdded] = useState(true);

  const handleToggle = () => {
    setIsInstallationAdded(!isInstallationAdded);
    onToggleInstallation(!isInstallationAdded);
  };

  if (!product) {
    return (
      <div className="product-box">
        <p className="product-loading">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="product-box">
      <div className="product-image">
        <img 
          src={product.image || '/placeholder-product.png'} 
          alt={product.name}
        />
      </div>
      
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        {installationProduct && (
          <p className="installation-info">
            + {installationProduct.name}
          </p>
        )}
      </div>
      
      <div className="product-actions">
        <div className="product-price">
          {product.currency} {product.price}
          {installationProduct && isInstallationAdded && (
            <span className="installation-price">
              + {installationProduct.currency} {installationProduct.price}
            </span>
          )}
        </div>
        
        {installationProduct && (
          <button 
            className={`toggle-button ${isInstallationAdded ? 'added' : 'removed'}`}
            onClick={handleToggle}
          >
            {isInstallationAdded ? 'Remove Installation' : 'Add Installation'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductBox;
