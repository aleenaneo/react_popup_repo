import React, { useState } from 'react';
import { checkZipcodeByAPI } from '../../api/installationService';
import { isValidZipcode } from '../../utils/helpers';
import './StepZipcode.css';

const StepZipcode = ({ onSuccess, onBack, onClose }) => {
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    // Validate zipcode
    if (!isValidZipcode(zipcode)) {
      setError('Please enter a valid 5-digit zipcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await checkZipcodeByAPI(zipcode);
      
      if (response.locations && response.locations.length > 0) {
        onSuccess(zipcode, response.locations);
      } else {
        setError('Sorry, installation service is not available in your area');
      }
    } catch (err) {
      setError('Failed to check zipcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleCheck();
    }
  };

  return (
    <div className="step-zipcode">
      <div className="step-header">
        <h3>Installation Zip Code <span className="header-subtitle">(Fill in to see available installation locations)</span></h3>
      </div>

      <div className="zipcode-input-group">
        <input
          type="text"
          className={`zipcode-input ${error ? 'error' : ''}`}
          placeholder="Start with your Zip Code"
          value={zipcode}
          onChange={(e) => {
            setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5));
            setError('');
          }}
          onKeyPress={handleKeyPress}
          maxLength={5}
          disabled={loading}
        />
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-secondary btn-back" 
          onClick={onBack}
          disabled={loading}
        >
          Go Back
        </button>
        <button 
          className="btn btn-secondary btn-cancel" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary btn-proceed" 
          onClick={handleCheck}
          disabled={loading || zipcode.length !== 5}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Checking...
            </>
          ) : (
            'Proceed'
          )}
        </button>
      </div>
    </div>
  );
};

export default StepZipcode;
