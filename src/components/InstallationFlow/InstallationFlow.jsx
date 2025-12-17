import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import ProductBox from '../ProductBox/ProductBox';
import StepZipcode from '../StepZipcode/StepZipcode';
import StepLocation from '../StepLocation/StepLocation';
import StepVehicle from '../StepVehicle/StepVehicle';
import StepSchedule from '../StepSchedule/StepSchedule';
import { addToCart } from '../../api/installationService';
import { getInitialData } from '../../api/apiConfig';
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
      appointment
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
      const cartData = {
        productId: initialData.product_id_th,
        installationId: includeInstallation ? installationProduct?.id : null,
        metadata: {
          zipcode: flowData.zipcode,
          member_id: flowData.memberId,
          vehicle: vehicle,
          appointment: flowData.appointment
        }
      };

      await addToCart(cartData);
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
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Nextbase_logo.svg/2560px-Nextbase_logo.svg.png" 
              alt="NEXTBASE" 
              className="intro-logo" 
            />
            <p>
              Take the hassle out of installation and have your new Nextbase Dash Cam installed by our partners and their trained engineers at a time and location of your choice (Hardwire Kit included). <a href="#" className="read-more-link">Read more</a>
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
