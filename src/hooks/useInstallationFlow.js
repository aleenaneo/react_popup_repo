/**
 * Custom hook for managing installation flow state
 */

import { useState } from 'react';

export const useInstallationFlow = () => {
  const [currentStep, setCurrentStep] = useState('zipcode'); // zipcode, location, vehicle, schedule
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
    },
    product: null,
    installationProduct: null
  });

  const updateFlowData = (key, value) => {
    setFlowData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateVehicle = (key, value) => {
    setFlowData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [key]: value
      }
    }));
  };

  const updateAppointment = (key, value) => {
    setFlowData(prev => ({
      ...prev,
      appointment: {
        ...prev.appointment,
        [key]: value
      }
    }));
  };

  const resetFlow = () => {
    setCurrentStep('zipcode');
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
      },
      product: null,
      installationProduct: null
    });
  };

  return {
    currentStep,
    setCurrentStep,
    flowData,
    updateFlowData,
    updateVehicle,
    updateAppointment,
    resetFlow
  };
};

export default useInstallationFlow;
