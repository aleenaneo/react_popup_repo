import React, { useState, useEffect } from 'react';
import { getYears, getMakes, getModels, getTypes } from '../../api/installationService';
import { createAttributeMapping, generateFullCartUrlWithAttributes } from '../../utils/helpers';
import './StepVehicle.css';

const StepVehicle = ({ onNext, onBack, onClose, initialVehicle = {}, product, relatedProducts, selectedLocation, appointment = {}, zipcode = '' }) => {
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

  const [cartAdded, setCartAdded] = useState(false);

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

  const handleNext = async () => {
    if (vehicle.year && vehicle.make && vehicle.model) {
      // Set cart added state immediately to show 'Added...' text
      setCartAdded(true);
      
      // Build details object with requested fields
      const extractMake = (m) => {
        if (!m) return '';
        if (typeof m === 'object') return m.make || m.name || m.id || m.makeID || '';
        return m;
      };

      const details = {
        year: vehicle.year,
        make: extractMake(vehicle.make),
        model: vehicle.model,
        date: appointment?.date || '',
        time: appointment?.time || '',
        memberId: selectedLocation?.member_id || ''
      };

      // Log main product, related products, selected location details, and vehicle details
      console.log('=== VEHICLE STEP CONTINUE BUTTON CLICKED ===');
      console.log('Main Product:', product || 'No product data');
      console.log('Related Products:', relatedProducts || 'No related products');
      console.log('Selected Location Details:', selectedLocation || 'No location selected');
      console.log('Vehicle Details:', vehicle);
      console.log('Details:', details);
      
      // Create attribute mapping based on the details
      const attributeMapping = createAttributeMapping(
        { year: details.year, make: details.make, model: details.model },
        { date: details.date, time: details.time },
        { member_id: details.memberId },
        zipcode
      );
      
      // Get the main product SKU with variant product logic
      const initialData = window.cm_nb_ra_in_config || {};
      
      // Check if variant_product is set to "yes"
      const isVariantProduct = initialData.variant_product === "yes";
      
      let mainProductSku;
      
      if (isVariantProduct) {
        // Get the selected SKU from the dropdown
        const variantSelect = document.getElementById("iq_product_sku_variation");
        if (variantSelect) {
          mainProductSku = variantSelect.value;
          console.log("Using selected variant SKU:", mainProductSku);
        } else {
          console.error("Variant product dropdown not found");
          alert("Configuration error: Variant product dropdown not found");
          return;
        }
      } else {
        // Use the default product SKU from config
        mainProductSku = initialData.product_sku;
      }
      
      if (!mainProductSku) {
        console.error('Main product SKU not found in configuration');
        alert('Product configuration error: Main product SKU not found');
        return;
      }
      
      // Get the vehicle-related product ID
      let vehicleProductId = null;
      
      if (relatedProducts && relatedProducts.length > 0) {
        // Use the entity ID of the first related product as per project specification
        vehicleProductId = relatedProducts[0].entityId;
        console.log('Using related product entity ID:', vehicleProductId);
      } else {
        // Fallback to the product_id_th if no related products found
        vehicleProductId = initialData.product_id_th;
        console.log('Using main product ID from API config as vehicle product:', vehicleProductId);
      }
      
      if (!vehicleProductId) {
        console.error('No product ID available for vehicle product');
        alert('Product configuration error: No vehicle product ID available');
        return;
      }
      
      // Create the main product cart URL with SKU
      const mainProductCartUrl = `/cart.php?action=add&sku=${encodeURIComponent(mainProductSku)}`;
      
      console.log('Generated main product cart URL:', mainProductCartUrl);
      
      // For BigCommerce, we need to handle multiple cart additions differently
      // We'll create a sequence of redirects to add both products
      
      // First, construct the URL for the main product
      const mainProductUrl = new URL(window.location.origin + mainProductCartUrl);
      
      // Then, construct the URL for the related product with attributes
      const relatedProductParams = new URLSearchParams();
      relatedProductParams.append('action', 'add');
      relatedProductParams.append('product_id', vehicleProductId);
      
      // Add each attribute to the URL
      for (const [attrId, value] of Object.entries(attributeMapping)) {
        if (value) { // Only add if value exists
          relatedProductParams.append(`attribute[${attrId}]`, value);
        }
      }
      
      const relatedProductCartUrl = `/cart.php?${relatedProductParams.toString()}`;
      
      console.log('Generated main product cart URL:', mainProductCartUrl);
      console.log('Generated related product cart URL:', relatedProductCartUrl);
      
      // Create an array of cart URLs to process
      const cartUrls = [mainProductCartUrl, relatedProductCartUrl];
      
      // Use a for loop with async/await to add each product to the cart
      for (const url of cartUrls) {
        try {
          // Add product to cart using fetch
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to add product to cart: ${response.status}`);
          }
          
          console.log('Product added to cart successfully:', url);
          
          // Small delay between requests to ensure proper processing
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          console.error('Error adding product to cart:', error);
          alert('Failed to add products to cart. Please try again.');
          return; // Exit if there's an error
        }
      }
      
      // After a short delay to show the 'Added...' text, redirect to cart
      setTimeout(() => {
        window.location.href = "/cart.php";
      }, 1000);
    }
  };

  const isFormComplete = vehicle.year && vehicle.make && vehicle.model;

  // Loading indicator component
  const LoadingSelect = ({ label }) => (
    <div className="form-group">
      <select disabled>
        <option>{label}</option>
      </select>
    </div>
  );

  return (
    <div className="step-vehicle">
      <div className="step-header">
        <h3>Please begin by selecting your vehicle below</h3>
      </div>

      <div className="vehicle-form">
        {/* Year Dropdown */}
        <div className="form-group">
          {loading.years ? (
            <LoadingSelect label="Loading years..." />
          ) : (
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
          )}
        </div>

        {/* Make Dropdown */}
        <div className="form-group">
          {loading.makes ? (
            <LoadingSelect label="Loading makes..." />
          ) : (
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
          )}
        </div>

        {/* Model Dropdown */}
        <div className="form-group">
          {loading.models ? (
            <LoadingSelect label="Loading models..." />
          ) : (
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
          )}
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
          disabled={!isFormComplete || cartAdded}
        >
          {cartAdded ? 'Added...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default StepVehicle;
