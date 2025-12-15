import React, { useState, useEffect } from 'react';
import { getYears, getMakes, getModels, getTypes } from '../../api/installationService';
import './StepVehicle.css';

const StepVehicle = ({ onNext, onBack, initialVehicle = {} }) => {
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

  // Load years on mount
  useEffect(() => {
    loadYears();
  }, []);

  // Load makes when year changes
  useEffect(() => {
    if (vehicle.year) {
      loadMakes(vehicle.year);
    } else {
      setOptions(prev => ({ ...prev, makes: [], models: [], types: [] }));
      setVehicle(prev => ({ ...prev, make: '', model: '', type: '' }));
    }
  }, [vehicle.year]);

  // Load models when make changes
  useEffect(() => {
    if (vehicle.year && vehicle.make) {
      loadModels(vehicle.year, vehicle.make);
    } else {
      setOptions(prev => ({ ...prev, models: [], types: [] }));
      setVehicle(prev => ({ ...prev, model: '', type: '' }));
    }
  }, [vehicle.make]);

  // Load types when model changes
  useEffect(() => {
    if (vehicle.model) {
      loadTypes(vehicle.model);
    } else {
      setOptions(prev => ({ ...prev, types: [] }));
      setVehicle(prev => ({ ...prev, type: '' }));
    }
  }, [vehicle.model]);

  const loadYears = async () => {
    setLoading(prev => ({ ...prev, years: true }));
    setErrors(prev => ({ ...prev, years: null }));
    try {
      const data = await getYears();
      setOptions(prev => ({ ...prev, years: data }));
    } catch (error) {
      setErrors(prev => ({ ...prev, years: 'Failed to load years' }));
    } finally {
      setLoading(prev => ({ ...prev, years: false }));
    }
  };

  const loadMakes = async (year) => {
    setLoading(prev => ({ ...prev, makes: true }));
    setErrors(prev => ({ ...prev, makes: null }));
    try {
      const data = await getMakes(year);
      setOptions(prev => ({ ...prev, makes: data }));
    } catch (error) {
      setErrors(prev => ({ ...prev, makes: 'Failed to load makes' }));
    } finally {
      setLoading(prev => ({ ...prev, makes: false }));
    }
  };

  const loadModels = async (year, make) => {
    setLoading(prev => ({ ...prev, models: true }));
    setErrors(prev => ({ ...prev, models: null }));
    try {
      const data = await getModels(year, make);
      setOptions(prev => ({ ...prev, models: data }));
    } catch (error) {
      setErrors(prev => ({ ...prev, models: 'Failed to load models' }));
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  const loadTypes = async (model) => {
    setLoading(prev => ({ ...prev, types: true }));
    setErrors(prev => ({ ...prev, types: null }));
    try {
      const data = await getTypes(model);
      setOptions(prev => ({ ...prev, types: data }));
    } catch (error) {
      setErrors(prev => ({ ...prev, types: 'Failed to load types' }));
    } finally {
      setLoading(prev => ({ ...prev, types: false }));
    }
  };

  const handleChange = (field, value) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
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
        <div className="step-icon">🚗</div>
        <h3>Vehicle Registration</h3>
        <p>Please provide your vehicle details for installation</p>
      </div>

      <div className="vehicle-form">
        {/* Year Dropdown */}
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            value={vehicle.year}
            onChange={(e) => handleChange('year', e.target.value)}
            disabled={loading.years}
            className={errors.years ? 'error' : ''}
          >
            <option value="">
              {loading.years ? 'Loading years...' : 'Select Year'}
            </option>
            {options.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.years && <span className="error-text">{errors.years}</span>}
        </div>

        {/* Make Dropdown */}
        <div className="form-group">
          <label htmlFor="make">Make</label>
          <select
            id="make"
            value={vehicle.make}
            onChange={(e) => handleChange('make', e.target.value)}
            disabled={!vehicle.year || loading.makes}
            className={errors.makes ? 'error' : ''}
          >
            <option value="">
              {loading.makes ? 'Loading makes...' : 'Select Make'}
            </option>
            {options.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
          {errors.makes && <span className="error-text">{errors.makes}</span>}
        </div>

        {/* Model Dropdown */}
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            value={vehicle.model}
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={!vehicle.make || loading.models}
            className={errors.models ? 'error' : ''}
          >
            <option value="">
              {loading.models ? 'Loading models...' : 'Select Model'}
            </option>
            {options.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.models && <span className="error-text">{errors.models}</span>}
        </div>

        {/* Type Dropdown */}
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={vehicle.type}
            onChange={(e) => handleChange('type', e.target.value)}
            disabled={!vehicle.model || loading.types}
            className={errors.types ? 'error' : ''}
          >
            <option value="">
              {loading.types ? 'Loading types...' : 'Select Type'}
            </option>
            {options.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.types && <span className="error-text">{errors.types}</span>}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isFormComplete}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepVehicle;
