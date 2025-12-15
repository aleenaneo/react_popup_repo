import React, { useState } from 'react';
import { checkZipcode } from '../../api/installationService';
import { isValidZipcode } from '../../utils/helpers';
import './StepZipcode.css';

const StepZipcode = ({ onSuccess, onCancel }) => {
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    // Validate zipcode
    if (!isValidZipcode(zipcode)) {
      setError('Please enter a valid 6-digit zipcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await checkZipcode(zipcode);
      
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
        <div className="step-icon">📍</div>
        <h3>Check Service Availability</h3>
        <p>Enter your zipcode to check if installation service is available in your area</p>
      </div>

      <div className="zipcode-input-group">
        <input
          type="text"
          className={`zipcode-input ${error ? 'error' : ''}`}
          placeholder="Enter 6-digit zipcode"
          value={zipcode}
          onChange={(e) => {
            setZipcode(e.target.value.replace(/\D/g, '').slice(0, 6));
            setError('');
          }}
          onKeyPress={handleKeyPress}
          maxLength={6}
          disabled={loading}
        />
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleCheck}
          disabled={loading || zipcode.length !== 6}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Checking...
            </>
          ) : (
            'Check Availability'
          )}
        </button>
      </div>
    </div>
  );
};

export default StepZipcode;
