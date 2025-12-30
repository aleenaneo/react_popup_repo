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
    // Add only the main product to cart
    setLoading(true);
    setError('');
    try {
      const initialData = getInitialData();
      await addToCart({
        productId: initialData.product_id_th,
        installationId: null,
        metadata: null
      });
      alert('Product added to cart successfully!');
      onClose();
    } catch (err) {
      setError('Failed to add product to cart. Please try again.');
    } finally {
      setLoading(false);
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
      
      // Fetch the main product details to get product options
      const mainProduct = await fetchProductBySku(product?.sku);
      
      // Prepare options for main product
      const mainProductOptions = {};
      if (mainProduct?.productOptions?.edges) {
        mainProduct.productOptions.edges.forEach(edge => {
          const option = edge.node;
          
          // Map vehicle data to the appropriate option based on display name
          if (option.displayName.toLowerCase().includes('vehicle year')) {
            mainProductOptions[option.entityId] = vehicle.year;
          } else if (option.displayName.toLowerCase().includes('vehicle make')) {
            mainProductOptions[option.entityId] = vehicle.make;
          } else if (option.displayName.toLowerCase().includes('vehicle modal')) { // Note: 'modal' as in your GraphQL response
            mainProductOptions[option.entityId] = vehicle.model;
          } else if (option.displayName.toLowerCase().includes('installation date')) {
            mainProductOptions[option.entityId] = flowData.appointment.date;
          } else if (option.displayName.toLowerCase().includes('time')) {
            mainProductOptions[option.entityId] = flowData.appointment.time;
          } else if (option.displayName.toLowerCase().includes('notes')) {
            mainProductOptions[option.entityId] = '';
          } else if (option.displayName.toLowerCase().includes('installer member id')) {
            mainProductOptions[option.entityId] = flowData.appointment.memberId || flowData.memberId || '';
          } else {
            // For any other options, set to empty string
            mainProductOptions[option.entityId] = '';
          }
        });
      }
      
      // Prepare options for related products (same options as main product for now)
      const relatedProductsCartData = relatedProducts.map(relatedProduct => {
        return {
          productId: relatedProduct.id,
          options: mainProductOptions, // Apply same options as main product
          installationId: null, // Related products don't include installation
          metadata: {
            zipcode: flowData.zipcode,
            member_id: flowData.appointment.memberId || flowData.memberId,
            vehicle: vehicle,
            appointment: flowData.appointment
          }
        };
      });
      
      // Add main product with options to cart
      await addToCart({
        productId: initialData.product_id_th,
        options: mainProductOptions,
        installationId: includeInstallation ? installationProduct?.id : null,
        metadata: {
          zipcode: flowData.zipcode,
          member_id: flowData.appointment.memberId || flowData.memberId,
          vehicle: vehicle,
          appointment: flowData.appointment
        }
      });
      
      // Add related products to cart
      for (const relatedProductData of relatedProductsCartData) {
        await addToCart(relatedProductData);
      }
      
      alert('Products added to cart successfully with installation details!');
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