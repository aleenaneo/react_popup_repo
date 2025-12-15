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
  const [includeInstallation, setIncludeInstallation] = useState(true);
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

  const handleProceedWithInstallation = () => {
    setCurrentStep('zipcode');
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
    setCurrentStep('vehicle');
  };

  const handleVehicleNext = (vehicle) => {
    setFlowData(prev => ({
      ...prev,
      vehicle
    }));
    setCurrentStep('schedule');
  };

  const handleScheduleNext = async (appointment) => {
    setFlowData(prev => ({
      ...prev,
      appointment
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
          vehicle: flowData.vehicle,
          appointment: appointment
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
    const stepOrder = ['intro', 'zipcode', 'location', 'vehicle', 'schedule'];
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
    setIncludeInstallation(true);
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
            <div className="intro-header">
              <div className="intro-icon">🔧</div>
              <h2>Professional Installation Service</h2>
              <p>Get your product professionally installed at your convenience</p>
            </div>

            <ProductBox
              product={product}
              installationProduct={installationProduct}
              onToggleInstallation={setIncludeInstallation}
            />

            {error && <div className="error-banner">{error}</div>}

            <div className="intro-actions">
              <button
                className="btn btn-outline"
                onClick={handleContinueWithoutInstallation}
                disabled={loading}
              >
                Continue Without Installation
              </button>
              <button
                className="btn btn-primary btn-large"
                onClick={handleProceedWithInstallation}
                disabled={loading || !includeInstallation}
              >
                {loading ? 'Processing...' : 'Proceed with Installation'}
              </button>
            </div>
          </div>
        );

      case 'zipcode':
        return (
          <StepZipcode
            onSuccess={handleZipcodeSuccess}
            onCancel={handleBack}
          />
        );

      case 'location':
        return (
          <StepLocation
            locations={flowData.locations}
            onNext={handleLocationNext}
            onBack={handleBack}
          />
        );

      case 'vehicle':
        return (
          <StepVehicle
            onNext={handleVehicleNext}
            onBack={handleBack}
            initialVehicle={flowData.vehicle}
          />
        );

      case 'schedule':
        return (
          <StepSchedule
            onNext={handleScheduleNext}
            onBack={handleBack}
            initialAppointment={flowData.appointment}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="installation-flow">
        {renderStep()}
      </div>
    </Modal>
  );
};

export default InstallationFlow;
