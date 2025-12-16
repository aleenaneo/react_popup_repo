import React, { useState } from 'react';
import Map from '../Map/Map';
import './StepLocation.css';

const StepLocation = ({ locations, onNext, onBack, onClose }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const handleLocationSelect = (memberId) => {
    setSelectedMemberId(memberId);
  };

  const handleContinue = () => {
    if (selectedMemberId) {
      const selectedLocation = locations.find(loc => loc.member_id === selectedMemberId);
      onNext(selectedMemberId, selectedLocation);
    }
  };

  return (
    <div className="step-location">
      <div className="step-header">
        <h3>Select installation location</h3>
      </div>

      <div className="location-layout">
        {/* Left Side: Map */}
        <div className="location-map-section">
          <Map
            locations={locations}
            onLocationSelect={handleLocationSelect}
            selectedMemberId={selectedMemberId}
          />
        </div>

        {/* Right Side: Location List */}
        <div className="location-list-section">
          <div className="location-list">
            {locations.map((location) => (
              <div 
                key={location.member_id}
                className={`location-card ${selectedMemberId === location.member_id ? 'selected' : ''}`}
                onClick={() => handleLocationSelect(location.member_id)}
              >
                <div className="location-info">
                  <h4>{location.name || `Service Center ${location.member_id}`}</h4>
                  <p>{location.address || `Member ID: ${location.member_id}`}</p>
                </div>
                {selectedMemberId === location.member_id && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
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
          onClick={handleContinue}
          disabled={!selectedMemberId}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
