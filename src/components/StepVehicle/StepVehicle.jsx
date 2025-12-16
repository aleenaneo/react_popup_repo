import React, { useState, useEffect } from 'react';
import { getYears, getMakes, getModels, getTypes } from '../../api/installationService';
import './StepVehicle.css';

const StepVehicle = ({ onNext, onBack, onClose, initialVehicle = {} }) => {
  const [vehicle, setVehicle] = useState({
    year: initialVehicle.year || '',
    make: initialVehicle.make || '',
    model: initialVehicle.model || '',
    type: initialVehicle.type || ''
  });

  const [options, setOptions] = useState({
    years: [],
    makes: [],
    models: [],
    types: []
  });

  const [loading, setLoading] = useState({
    years: false,
    makes: false,
    models: false,
    types: false
  });

  const [errors, setErrors] = useState({});

  // Load initial data (Years and Makes)
  useEffect(() => {
    loadYears();
    loadMakes(); // Load default or all makes
  }, []);

  // When Make changes, load Models
  useEffect(() => {
    if (vehicle.make) {
      // Pass null for year if we changed the order to Make first
      loadModels(null, vehicle.make);
    } else {
      setOptions(prev => ({ ...prev, models: [], types: [] }));
    }
  }, [vehicle.make]);

  // When Model changes, load Types
  useEffect(() => {
    if (vehicle.model) {
      loadTypes(vehicle.model);
    } else {
      setOptions(prev => ({ ...prev, types: [] }));
    }
  }, [vehicle.model]);

  const loadYears = async () => {
    setLoading(prev => ({ ...prev, years: true }));
    try {
      const data = await getYears();
      setOptions(prev => ({ ...prev, years: data }));
    } catch (error) {
      console.error("Failed to load years", error);
    } finally {
      setLoading(prev => ({ ...prev, years: false }));
    }
  };

  const loadMakes = async () => {
    setLoading(prev => ({ ...prev, makes: true }));
    try {
      // Call with no arguments to get default/all makes in mock
      const data = await getMakes(); 
      setOptions(prev => ({ ...prev, makes: data }));
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
      setOptions(prev => ({ ...prev, models: data }));
    } catch (error) {
      console.error("Failed to load models", error);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  const loadTypes = async (model) => {
    setLoading(prev => ({ ...prev, types: true }));
    try {
      const data = await getTypes(model);
      setOptions(prev => ({ ...prev, types: data }));
    } catch (error) {
      console.error("Failed to load types", error);
    } finally {
      setLoading(prev => ({ ...prev, types: false }));
    }
  };

  const handleChange = (field, value) => {
    setVehicle(prev => {
      const newState = { ...prev, [field]: value };
      
      // Reset dependent fields
      if (field === 'make') {
        newState.model = '';
        newState.type = '';
        // Years remain
      } else if (field === 'model') {
        newState.type = '';
      }
      return newState;
    });
  };

  const handleNext = () => {
    if (vehicle.year && vehicle.make && vehicle.model && vehicle.type) {
      onNext(vehicle);
    }
  };

  const isFormComplete = vehicle.year && vehicle.make && vehicle.model && vehicle.type;

  return (
    <div className="step-vehicle">
      <div className="step-header">
        <h3>Please begin by selecting your vehicle below</h3>
      </div>

      <div className="vehicle-form">
        {/* Make Dropdown */}
        <div className="form-group">
          <select
            id="make"
            value={vehicle.make}
            onChange={(e) => handleChange('make', e.target.value)}
            disabled={loading.makes}
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
            disabled={!vehicle.make || loading.models}
          >
            <option value="">Select Model</option>
            {options.models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div className="form-group">
          <select
            id="year"
            value={vehicle.year}
            onChange={(e) => handleChange('year', e.target.value)}
            disabled={!vehicle.model || loading.years}
          >
            <option value="">Select Year</option>
            {options.years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Type Dropdown */}
        <div className="form-group">
          <select
            id="type"
            value={vehicle.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={!vehicle.year || loading.types}
          >
            <option value="">Select Type</option>
            {options.types.map((type) => (
              <option key={type} value={type}>{type}</option>
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
