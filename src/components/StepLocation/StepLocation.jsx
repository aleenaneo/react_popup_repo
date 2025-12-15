import React, { useState } from 'react';
import Map from '../Map/Map';
import './StepLocation.css';

const StepLocation = ({ locations, onNext, onBack }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const handleLocationSelect = (memberId) => {
    setSelectedMemberId(memberId);
  };

  const handleNext = () => {
    if (selectedMemberId) {
      const selectedLocation = locations.find(loc => loc.member_id === selectedMemberId);
      onNext(selectedMemberId, selectedLocation);
    }
  };

  return (
    <div className="step-location">
      <div className="step-header">
        <div className="step-icon">🗺️</div>
        <h3>Select Service Location</h3>
        <p>Choose the nearest service center from the map below</p>
      </div>

      <Map
        locations={locations}
        onLocationSelect={handleLocationSelect}
        selectedMemberId={selectedMemberId}
      />

      {selectedMemberId && (
        <div className="location-selected">
          <span className="check-icon">✓</span>
          Location selected (Member ID: {selectedMemberId})
        </div>
      )}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedMemberId}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
