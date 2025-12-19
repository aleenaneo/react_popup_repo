import React, { useState, useEffect } from 'react';
import InstallationFlow from './components/InstallationFlow/InstallationFlow';
import { getInitialData } from './api/apiConfig';
import { detectPageType } from './utils/helpers';
import { enableMockMode, disableMockMode } from './api/mockApiService';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageType, setPageType] = useState('pdp');
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    // For testing with real API, disable mock mode
    const initialData = getInitialData();
    if (initialData.mode === 'development' || initialData.mode === 'local') {
      // Disable mock mode to use real API
      disableMockMode();
      console.log('🔌 Real API mode enabled');
    }

    // Detect page type
    const type = detectPageType();
    setPageType(type);

    // Set up demo product data
    setProductData({
      id: initialData.product_id_th || '123',
      name: 'Premium Car Tires (Set of 4)',
      price: '299.99',
      currency: initialData.currency_code || 'USD',
      image: 'https://via.placeholder.com/400x400/007bff/ffffff?text=Car+Tires'
    });

    // Attach event listeners to theme buttons
    attachButtonListeners(type);

    return () => {
      // Cleanup listeners
      removeButtonListeners(type);
    };
  }, []);

  const attachButtonListeners = (type) => {
    let selectors = [];

    switch (type) {
      case 'pdp':
        selectors = [
          '.add-to-cart-button', 
          '#add-to-cart', 
          '[data-add-to-cart]',
          '#form-action-addToCart',
          '.cm_variant_main_add_to_cart_button',
          '.iq_buy_button',
          '.cm-iq-buy-button',
          '.cm_variant_button_add_to_cart'
        ];
        break;
      case 'plp':
        selectors = ['.product-card-button', '.quick-add-button'];
        break;
      case 'cart':
        selectors = ['.checkout-button', '#checkout'];
        break;
      default:
        selectors = [
          '.add-to-cart-button',
          '#form-action-addToCart',
          '.cm_variant_main_add_to_cart_button'
        ];
    }

    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
      });
    });
  };

  const removeButtonListeners = (type) => {
    let selectors = [];

    switch (type) {
      case 'pdp':
        selectors = [
          '.add-to-cart-button', 
          '#add-to-cart', 
          '[data-add-to-cart]',
          '#form-action-addToCart',
          '.cm_variant_main_add_to_cart_button',
          '.iq_buy_button',
          '.cm-iq-buy-button',
          '.cm_variant_button_add_to_cart'
        ];
        break;
      case 'plp':
        selectors = ['.product-card-button', '.quick-add-button'];
        break;
      case 'cart':
        selectors = ['.checkout-button', '#checkout'];
        break;
      default:
        selectors = [
          '.add-to-cart-button',
          '#form-action-addToCart',
          '.cm_variant_main_add_to_cart_button'
        ];
    }

    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        button.removeEventListener('click', handleButtonClick);
      });
    });
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const installationProduct = {
    id: '456',
    name: 'Professional Tire Installation',
    price: '49.99',
    currency: productData?.currency || 'USD'
  };

  return (
    <div className="app">
      {/* Demo trigger button for testing */}
      {import.meta.env.DEV && (
        <div className="demo-section">
          <h1>BigCommerce Installation Flow Demo</h1>
          <p className="demo-description">
            Click the button below to simulate the installation flow popup
          </p>
          <button
            className="demo-trigger-button"
            onClick={() => setIsModalOpen(true)}
          >
            🛒 Add to Cart (Demo)
          </button>
          <div className="demo-info">
            <p><strong>Page Type:</strong> {pageType.toUpperCase()}</p>
            <p><strong>Mode:</strong> {getInitialData().mode}</p>
          </div>
        </div>
      )}

      {/* Installation Flow Modal */}
      <InstallationFlow
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={productData}
        installationProduct={installationProduct}
      />
    </div>
  );
}

export default App;
