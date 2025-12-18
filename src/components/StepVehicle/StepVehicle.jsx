import React, { useState, useEffect } from 'react';
import { getYears, getMakes, getModels, getTypes } from '../../api/installationService';
import './StepVehicle.css';

const StepVehicle = ({ onNext, onBack, onClose, initialVehicle = {} }) => {
  const [vehicle, setVehicle] = useState({
    year: initialVehicle.year || '',
    make: initialVehicle.make || '',
    model: initialVehicle.model || ''
  });

  const [options, setOptions] = useState({
    years: [],
    makes: [],
    models: []
  });

  const [loading, setLoading] = useState({
    years: false,
    makes: false,
    models: false
  });

  const [errors, setErrors] = useState({});

  // Load initial data (Years)
  useEffect(() => {
    loadYears();
  }, []);

  // When Year changes, load Makes
  useEffect(() => {
    if (vehicle.year) {
      loadMakes(vehicle.year);
    } else {
      setOptions(prev => ({ ...prev, makes: [], models: [] }));
    }
  }, [vehicle.year]);

  // When Make changes, load Models
  useEffect(() => {
    if (vehicle.year && vehicle.make) {
      loadModels(vehicle.year, vehicle.make);
    } else {
      setOptions(prev => ({ ...prev, models: [] }));
    }
  }, [vehicle.make, vehicle.year]);



  const loadYears = async () => {
    setLoading(prev => ({ ...prev, years: true }));
    try {
      const data = await getYears();
      // Ensure data is an array
      const yearsArray = Array.isArray(data) ? data : [];
      setOptions(prev => ({ ...prev, years: yearsArray }));
    } catch (error) {
      console.error("Failed to load years", error);
    } finally {
      setLoading(prev => ({ ...prev, years: false }));
    }
  };

  const loadMakes = async () => {
    setLoading(prev => ({ ...prev, makes: true }));
    try {
      const data = await getMakes(vehicle.year); 
      // Ensure data is an array
      const makesArray = Array.isArray(data) ? data : [];
      setOptions(prev => ({ ...prev, makes: makesArray }));
    } catch (error) {
      console.error("Failed to load makes", error);
    } finally {
      setLoading(prev => ({ ...prev, makes: false }));
    }
  };

  const loadModels = async (year, make) => {
    setLoading(prev => ({ ...prev, models: true }));
    try {
      const data = await getModels(year, make);
      // Ensure data is an array
      const modelsArray = Array.isArray(data) ? data : [];
      setOptions(prev => ({ ...prev, models: modelsArray }));
    } catch (error) {
      console.error("Failed to load models", error);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };



  const handleChange = (field, value) => {
    setVehicle(prev => {
      const newState = { ...prev, [field]: value };
      
      // Reset dependent fields
      if (field === 'make') {
        newState.model = '';
        // Years remain
      }
      return newState;
    });
  };

  const handleNext = () => {
    if (vehicle.year && vehicle.make && vehicle.model) {
      onNext(vehicle);
    }
  };

  const isFormComplete = vehicle.year && vehicle.make && vehicle.model;

  return (
    <div className="step-vehicle">
      <div className="step-header">
        <h3>Please begin by selecting your vehicle below</h3>
      </div>

      <div className="vehicle-form">
        {/* Year Dropdown */}
        <div className="form-group">
          <select
            id="year"
            value={vehicle.year}
            onChange={(e) => handleChange('year', e.target.value)}
            disabled={loading.years}
          >
            <option value="">Select Year</option>
            {options.years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Make Dropdown */}
        <div className="form-group">
          <select
            id="make"
            value={vehicle.make}
            onChange={(e) => handleChange('make', e.target.value)}
            disabled={!vehicle.year || loading.makes}
          >
            <option value="">Select Make</option>
            {options.makes.map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        {/* Model Dropdown */}
        <div className="form-group">
          <select
            id="model"
            value={vehicle.model}
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={!vehicle.year || !vehicle.make || loading.models}
          >
            <option value="">Select Model</option>
            {options.models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>


      </div>

      <div className="step-actions">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          Go Back
        </button>
        <button className="btn btn-secondary btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary btn-continue"
          onClick={handleNext}
          disabled={!isFormComplete}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default StepVehicle;
