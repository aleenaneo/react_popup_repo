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

  // Debugging: Log options changes
  useEffect(() => {
    console.log('Options updated:', options);
    console.log('Years in options:', options.years);
    console.log('Number of years:', options.years.length);
  }, [options]);

  // Load initial data (Years)
  useEffect(() => {
    console.log('Loading years...');
    loadYears();
  }, []);

  // When Year changes, load Makes
  useEffect(() => {
    console.log('Year changed, vehicle state:', vehicle);
    console.log('Selected year:', vehicle.year);
    if (vehicle.year) {
      loadMakes(vehicle.year);
    } else {
      console.log('No year selected, clearing makes and models');
      setOptions(prev => ({ ...prev, makes: [], models: [] }));
    }
  }, [vehicle.year]);

  // When Make changes, load Models
  useEffect(() => {
    console.log('Make or year changed, vehicle state:', vehicle);
    console.log('Selected year:', vehicle.year);
    console.log('Selected make:', vehicle.make);
    console.log('Type of selected make:', typeof vehicle.make);
    
    // Extract make ID if the make is an object
    let makeId = vehicle.make;
    if (typeof vehicle.make === 'object' && vehicle.make !== null) {
      // Look for various possible ID field names including makeID from API
      makeId = vehicle.make.id || vehicle.make.makeID || vehicle.make.makeId || vehicle.make.make_id;
      console.log('Extracted make ID from object:', makeId);
    } else {
      // If we have a simple string make, we might need to map it to an ID
      // Based on your curl example, it looks like the API expects numeric IDs
      console.log('Using make as ID (string or number):', makeId);
            
      // Instead of static mapping, we'll try to extract the ID from the makes data
      // First, let's find the selected make in our options to get its ID
      console.log('Searching for make in options:', makeId);
      console.log('Available makes:', options.makes);
            
      const selectedMakeObj = options.makes.find(make => {
        if (typeof make === 'object') {
          // Compare the make value with the makeId
          return make.make === makeId || make.name === makeId || make.id == makeId || make.makeID == makeId;
        }
        return make === makeId;
      });
            
      console.log('Found make object:', selectedMakeObj);
            
      if (selectedMakeObj && typeof selectedMakeObj === 'object') {
        // Extract the ID from the make object, including makeID from API
        makeId = selectedMakeObj.id || selectedMakeObj.makeID || selectedMakeObj.makeId || selectedMakeObj.make_id;
        console.log('Extracted make ID from selected make object:', makeId);
      } else if (selectedMakeObj && typeof selectedMakeObj !== 'object') {
        // If the make is not an object, use it directly
        makeId = selectedMakeObj;
        console.log('Using make as ID:', makeId);
      } else {
        console.log('Could not find make object or extract ID, using make as ID:', makeId);
      }
    }
    
    if (vehicle.year && vehicle.make) {
      console.log(`Loading models for year ${vehicle.year} and make ID ${makeId}`);
      loadModels(vehicle.year, makeId);
    } else {
      console.log('Missing year or make, clearing models');
      setOptions(prev => ({ ...prev, models: [] }));
    }
  }, [vehicle.make, vehicle.year]);



  const loadYears = async () => {
    setLoading(prev => ({ ...prev, years: true }));
    try {
      const data = await getYears();
      console.log('Years data received in StepVehicle:', data);
      console.log('Type of years data:', typeof data);
      console.log('Is years data an array:', Array.isArray(data));
      
      // Ensure data is an array
      const yearsArray = Array.isArray(data) ? data : [];
      console.log('Final years array for dropdown:', yearsArray);
      
      setOptions(prev => ({ ...prev, years: yearsArray }));
      
      // Log the update to options
      console.log('Updated options with years:', { ...options, years: yearsArray });
    } catch (error) {
      console.error("Failed to load years", error);
    } finally {
      setLoading(prev => ({ ...prev, years: false }));
    }
  };

  const loadMakes = async (year) => {
    if (!year) {
      console.log('No year provided, not loading makes');
      return;
    }
    
    console.log('Loading makes for year:', year);
    setLoading(prev => ({ ...prev, makes: true }));
    try {
      const data = await getMakes(year); 
      console.log('Raw makes data received:', data);
      
      // Ensure data is an array
      const makesArray = Array.isArray(data) ? data : [];
      console.log('Makes array:', makesArray);
      
      // Log the structure of the first few items to understand the data format
      if (makesArray.length > 0) {
        console.log('First few makes items:', makesArray.slice(0, 3));
      }
      
      setOptions(prev => ({ ...prev, makes: makesArray }));
    } catch (error) {
      console.error("Failed to load makes", error);
    } finally {
      setLoading(prev => ({ ...prev, makes: false }));
    }
  };

  const loadModels = async (year, make) => {
    if (!year || !make) {
      console.log('Missing year or make, not loading models');
      return;
    }
    
    console.log('Loading models for year and make:', year, make);
    setLoading(prev => ({ ...prev, models: true }));
    try {
      const data = await getModels(year, make);
      console.log('Models data received:', data);
      // Ensure data is an array
      const modelsArray = Array.isArray(data) ? data : [];
      console.log('Models array:', modelsArray);
      setOptions(prev => ({ ...prev, models: modelsArray }));
    } catch (error) {
      console.error("Failed to load models", error);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };



  const handleChange = (field, value) => {
    console.log(`Changing field ${field} to value:`, value);
    console.log('Type of value:', typeof value);
    if (typeof value === 'object') {
      console.log('Value is an object:', value);
    }
    setVehicle(prev => {
      const newState = { ...prev, [field]: value };
      
      // Reset dependent fields
      if (field === 'make') {
        newState.model = '';
        // Years remain
      }
      
      console.log('Updated vehicle state:', newState);
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
            {[...options.years].reverse().map((year, index) => {
              // Handle both string/number years and object years
              const yearValue = typeof year === 'object' ? year.year || year.yearID || year.id || JSON.stringify(year) : year;
              const yearDisplay = typeof year === 'object' ? year.year || year.name || yearValue : year;
              // Use a combination of value and index to ensure uniqueness
              const yearKey = `${typeof year === 'object' ? year.year || year.yearID || year.id || index : year}-${index}`;
              
              return (
                <option key={yearKey} value={yearValue}>
                  {yearDisplay}
                </option>
              );
            })}
          </select>
        </div>

        {/* Make Dropdown */}
        <div className="form-group">
          <select
            id="make"
            value={typeof vehicle.make === 'object' ? vehicle.make.make || vehicle.make.makeID || '' : vehicle.make}
            onChange={(e) => {
              // Find the selected make object from options
              const selectedMake = options.makes.find(make => {
                if (typeof make === 'object') {
                  return make.make === e.target.value || make.makeID == e.target.value || make.id == e.target.value;
                }
                return make === e.target.value;
              });
              
              // Pass the full object if found, otherwise pass the value
              handleChange('make', selectedMake || e.target.value);
            }}
            disabled={!vehicle.year || loading.makes}
          >
            <option value="">Select Make</option>
            {[...options.makes].reverse().map((make, index) => {
              // Handle both string/number makes and object makes
              const makeValue = typeof make === 'object' ? make.make || make.makeID || make.id || JSON.stringify(make) : make;
              const makeDisplay = typeof make === 'object' ? make.make || make.name || makeValue : make;
              // Use a combination of value and index to ensure uniqueness
              const makeKey = `${typeof make === 'object' ? make.make || make.makeID || make.id || index : make}-${index}`;
              
              return (
                <option key={makeKey} value={makeValue}>
                  {makeDisplay}
                </option>
              );
            })}
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
            {[...options.models].reverse().map((model, index) => {
              // Handle both string/number models and object models
              const modelValue = typeof model === 'object' ? model.model || model.modelID || model.id || JSON.stringify(model) : model;
              const modelDisplay = typeof model === 'object' ? model.model || model.name || modelValue : model;
              // Use a combination of value and index to ensure uniqueness
              const modelKey = `${typeof model === 'object' ? model.model || model.modelID || model.id || index : model}-${index}`;
              
              return (
                <option key={modelKey} value={modelValue}>
                  {modelDisplay}
                </option>
              );
            })}
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
