import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import ProductBox from '../ProductBox/ProductBox';
import StepZipcode from '../StepZipcode/StepZipcode';
import StepLocation from '../StepLocation/StepLocation';
import StepVehicle from '../StepVehicle/StepVehicle';
import StepSchedule from '../StepSchedule/StepSchedule';
import { addToCart, addMultipleToCart } from '../../api/installationService';
import { getInitialData } from '../../api/apiConfig';
import { fetchRelatedProductsBySku, fetchProductBySku } from '../../api/graphqlService';
import './InstallationFlow.css';

const InstallationFlow = ({ isOpen, onClose, product, installationProduct }) => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, zipcode, location, vehicle, schedule
  const [flowData, setFlowData] = useState({
    zipcode: '',
    locations: [],
    selectedLocation: null,
    memberId: null,
    vehicle: {
      year: '',
      make: '',
      model: '',
      type: ''
    },
    appointment: {
      date: '',
      time: '',
      stayWithVehicle: true
    }
  });
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Get store logo from initial data
  const initialData = getInitialData();
  const storeLogo = initialData.store_logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Nextbase_logo.svg/2560px-Nextbase_logo.svg.png'; // fallback to default if not provided

  // Map vehicle/appointment details to product options using phf_mapping configuration
  const mapDetailsToProductOptions = (mainProduct, details) => {
    const options = {};
    
    if (!mainProduct?.productOptions?.edges) {
      return options;
    }
    
    // Get the mapping configuration
    const mappingConfig = window.cm_nb_ra_in_config?.phf_mapping || {};
    
    // Map each detail to the corresponding product option based on display name
    mainProduct.productOptions.edges.forEach(edge => {
      const option = edge.node;
      
      // Look for matching key in phf_mapping
      let matchedValue = null;
      for (const [detailKey, displayName] of Object.entries(mappingConfig)) {
        if (option.displayName.toLowerCase().includes(displayName.toLowerCase())) {
          // Map the detail value to the option's entityId
          matchedValue = details[detailKey] || '';
          break;
        }
      }
      
      // If no match found in phf_mapping, check for common patterns
      if (matchedValue === null) {
        if (option.displayName.toLowerCase().includes('vehicle year')) {
          matchedValue = details.year || '';
        } else if (option.displayName.toLowerCase().includes('vehicle make')) {
          matchedValue = details.make || '';
        } else if (option.displayName.toLowerCase().includes('vehicle modal')) {
          matchedValue = details.model || '';
        } else if (option.displayName.toLowerCase().includes('installation date')) {
          matchedValue = details.date || '';
        } else if (option.displayName.toLowerCase().includes('time')) {
          matchedValue = details.time || '';
        } else if (option.displayName.toLowerCase().includes('installer member id')) {
          matchedValue = details.memberId || '';
        } else if (option.displayName.toLowerCase().includes('zip code')) {
          matchedValue = details.zipcode || '';
        } else {
          // For any other options, set to empty string
          matchedValue = '';
        }
      }
      
      // Use the option's entityId as the key and the matched value
      options[option.entityId] = matchedValue;
    });
    
    return options;
  };

  // Fetch related products when component mounts
  useEffect(() => {
    if (product && product.sku) {
      const fetchRelated = async () => {
        try {
          // Fetch related products using the default currency from config
          const related = await fetchRelatedProductsBySku(product.sku);
          setRelatedProducts(related);
        } catch (err) {
          console.error('Error fetching related products:', err);
          setRelatedProducts([]);
        }
      };
      fetchRelated();
    }
  }, [product]);

  // Handle read more link click - use the path of the first related product if available
  const handleReadMoreClick = (e) => {
    e.preventDefault();
    if (relatedProducts.length > 0 && relatedProducts[0].path) {
      // Navigate to the related product path
      window.open(relatedProducts[0].path, '_blank');
    } else {
      // Fallback behavior if no related product path is available
      console.log('No related product path available');
    }
  };

  const handleContinueWithoutInstallation = async () => {
    // Create cart URL with product SKU from config
    try {
      const config = window.cm_nb_ra_in_config || {};
      
      // Check if variant_product is set to "yes"
      const isVariantProduct = config.variant_product === "yes";
      
      let productSku;
      
      if (isVariantProduct) {
        // Get the selected SKU from the dropdown
        const variantSelect = document.getElementById("iq_product_sku_variation");
        if (variantSelect) {
          productSku = variantSelect.value;
          console.log("Using selected variant SKU:", productSku);
        } else {
          console.error("Variant product dropdown not found");
          setError("Configuration error: Variant product dropdown not found");
          return;
        }
      } else {
        // Use the default product SKU from config
        productSku = config.product_sku;
      }
      
      if (!productSku) {
        console.error('Product SKU not found in configuration');
        setError('Configuration error: Product SKU not available');
        return;
      }
      
      // Create the cart URL with the SKU
      const cartUrl = `/cart.php?action=add&sku=${encodeURIComponent(productSku)}`;
      console.log("cartUrl",cartUrl);
      
      
      // Redirect to the cart URL
      window.location.href = cartUrl;
      console.log("window.location.href",window.location.href);
      
      
      // Close the modal after redirect
      onClose();
    } catch (err) {
      setError('Failed to create cart URL. Please try again.');
    }
  };

  const handleToggleInstallation = (added) => {
    setIncludeInstallation(added);
    if (added) {
      setCurrentStep('zipcode');
    } else {
      setCurrentStep('intro');
    }
  };

  const handleZipcodeSuccess = (zipcode, locations) => {
    setFlowData(prev => ({
      ...prev,
      zipcode,
      locations
    }));
    setCurrentStep('location');
  };

  const handleLocationNext = (memberId, location) => {
    setFlowData(prev => ({
      ...prev,
      memberId,
      selectedLocation: location
    }));
    setCurrentStep('schedule');
  };

  const handleScheduleNext = (appointment) => {
    setFlowData(prev => ({
      ...prev,
      appointment: {
        ...appointment,
        // Ensure member_id from location step is preserved
        memberId: appointment.memberId || flowData.memberId
      }
    }));
    setCurrentStep('vehicle');
  };

  const handleVehicleNext = async (vehicle) => {
    setFlowData(prev => ({
      ...prev,
      vehicle
    }));

    // Final step: Add to cart with all metadata
    setLoading(true);
    setError('');
    try {
      const initialData = getInitialData();
      
      // Get product SKU from config as specified in the requirement
      const config = window.cm_nb_ra_in_config || {};
      const productSku = config.product_sku;
      
      if (!productSku) {
        console.error('Product SKU not found in configuration');
        setError('Configuration error: Product SKU not available');
        setLoading(false);
        return;
      }
      
      // Fetch the main product details to get product options
      const mainProduct = await fetchProductBySku(productSku);
      
      // Build a details object to include in metadata (year, make, model, date, time, memberId, zipcode)
      const details = {
        year: vehicle.year,
        make: typeof vehicle.make === 'object' ? (vehicle.make.make || vehicle.make.name || vehicle.make.id || vehicle.makeID) : vehicle.make,
        model: vehicle.model,
        date: flowData.appointment?.date || '',
        time: flowData.appointment?.time || '',
        memberId: flowData.appointment?.memberId || flowData.memberId || flowData.selectedLocation?.member_id || '',
        zipcode: flowData.zipcode
      };

      console.log('Details prepared for mapping:', details);
      
      // Prepare options for main product using the mapping function
      const mainProductOptions = mapDetailsToProductOptions(mainProduct, details);
      
      console.log('Main product options after mapping:', mainProductOptions);

      // Prepare cart data for the main product
      const mainProductCartData = {
        productId: mainProduct?.entityId || mainProduct?.id,
        options: {
          ...mainProductOptions,
          // Ensure zip code is added as attribute 385 if not already in the mapped options
          ...(flowData.zipcode && !mainProductOptions['385'] && { '385': flowData.zipcode })
        },
        installationId: null,
        metadata: {
          zipcode: flowData.zipcode,
          member_id: flowData.appointment?.memberId || flowData.memberId || flowData.selectedLocation?.member_id || '',
          vehicle: vehicle,
          appointment: flowData.appointment,
          details: details
        }
      };
      
      // Add main product to cart
      await addToCart(mainProductCartData);
      
      // Prepare options for related products
      const relatedProductsCartData = relatedProducts.map(relatedProduct => {
        // For related products, use their specific product options
        const relatedProductId = relatedProduct.entityId || relatedProduct.id;
        if (!relatedProductId) {
          console.warn('No valid product ID found for related product:', relatedProduct);
          return null; // Skip this product
        }
        
        // Map details to this specific related product's options
        const relatedProductOptions = mapDetailsToProductOptions(relatedProduct, details);
        
        return {
          productId: relatedProductId, // Use the related product's entityId, fallback to id
          options: {
            ...relatedProductOptions, // Apply mapped options specific to this related product
            // Ensure zip code is added as attribute 385 if not already in the mapped options
            ...(flowData.zipcode && !relatedProductOptions['385'] && { '385': flowData.zipcode })
          },
          installationId: null, // Related products don't include installation
          metadata: {
            zipcode: flowData.zipcode,
            member_id: flowData.appointment?.memberId || flowData.memberId || flowData.selectedLocation?.member_id || '',
            vehicle: vehicle,
            appointment: flowData.appointment,
            details: details
          }
        };
      }).filter(Boolean); // Remove any null entries
      
      // Add related products to cart
      for (const relatedProductData of relatedProductsCartData) {
        await addToCart(relatedProductData);
      }
      
      alert('Main product and related products added to cart successfully with vehicle details!');
      onClose();
      resetFlow();
    } catch (err) {
      setError('Failed to complete checkout. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    const stepOrder = ['intro', 'zipcode', 'location', 'schedule', 'vehicle'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const resetFlow = () => {
    setCurrentStep('intro');
    setFlowData({
      zipcode: '',
      locations: [],
      selectedLocation: null,
      memberId: null,
      vehicle: {
        year: '',
        make: '',
        model: '',
        type: ''
      },
      appointment: {
        date: '',
        time: '',
        stayWithVehicle: true
      }
    });
    setIncludeInstallation(false);
    setError('');
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="intro-step">
            {error && <div className="error-banner">{error}</div>}

            <div className="intro-actions">
              <button
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={handleContinueWithoutInstallation}
                disabled={loading}
              >
                Continue Without Installation
              </button>
            </div>
          </div>
        );

      case 'zipcode':
        return (
          <StepZipcode
            onSuccess={handleZipcodeSuccess}
            onBack={handleBack}
            onClose={handleClose}
          />
        );

      case 'location':
        return (
          <StepLocation
            locations={flowData.locations}
            onNext={handleLocationNext}
            onBack={handleBack}
            onClose={handleClose}
          />
        );

      case 'schedule':
        return (
          <StepSchedule
            onNext={handleScheduleNext}
            onBack={handleBack}
            onClose={handleClose}
            initialAppointment={flowData.appointment}
          />
        );

      case 'vehicle':
        return (
          <StepVehicle
            onNext={handleVehicleNext}
            onBack={handleBack}
            onClose={handleClose}
            initialVehicle={flowData.vehicle}
            product={product}
            relatedProducts={relatedProducts}
            selectedLocation={flowData.selectedLocation}
            appointment={flowData.appointment}
            zipcode={flowData.zipcode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="installation-flow">
        {/* Persistent Header Section - Visible across ALL steps */}
        <div className="flow-header-section">
          <div className="intro-header">
            <img 
              src={storeLogo} 
              alt="Store Logo" 
              className="intro-logo" 
            />
            <p>
              Take the hassle out of installation and have your new Nextbase Dash Cam installed by our partners and their trained engineers at a time and location of your choice (Hardwire Kit included). <a href="#" onClick={handleReadMoreClick} className="read-more-link">Read more</a>
            </p>
          </div>

          <ProductBox
            product={product}
            installationProduct={installationProduct}
            onToggleInstallation={handleToggleInstallation}
          />
        </div>

        {/* Dynamic Step Content */}
        <div className="flow-content-section">
          {renderStep()}
        </div>
      </div>
    </Modal>
  );
};

export default InstallationFlow;