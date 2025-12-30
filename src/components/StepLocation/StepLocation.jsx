import React, { useState, useEffect, useRef } from 'react';
import Map from '../Map/Map';
import './StepLocation.css';

const StepLocation = ({ locations, onNext, onBack, onClose }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const locationListRef = useRef(null);
  const locationCardRefs = useRef({});

  const handleLocationSelect = (memberId) => {
    setSelectedMemberId(memberId);
    
    // Scroll to the selected location card after a short delay to ensure DOM update
    setTimeout(() => {
      // Find the first matching location by memberId for scrolling
      const matchingLocation = locations.find(loc => loc.member_id === memberId);
      if (matchingLocation && locationListRef.current) {
        // Find the index of the matching location to construct the correct ref key
        const matchingIndex = locations.findIndex(loc => loc.member_id === memberId);
        if (matchingIndex !== -1) {
          const uniqueKey = `${memberId || 'no-id'}-${matchingIndex}`;
          if (locationCardRefs.current[uniqueKey]) {
            locationCardRefs.current[uniqueKey].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
    }, 100);
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
        {/* Map Section */}
        <div className="location-map-section">
          <Map
            locations={locations}
            onLocationSelect={handleLocationSelect}
            selectedMemberId={selectedMemberId}
          />
        </div>

        {/* Location List */}
        <div className="location-list-section" ref={locationListRef}>
          <div className="location-list">
            {locations.map((location, index) => (
              <div 
                key={`${location.member_id || 'no-id'}-${index}`}
                ref={el => locationCardRefs.current[`${location.member_id || 'no-id'}-${index}`] = el}
                className={`location-card ${selectedMemberId === location.member_id ? 'selected' : ''}`}
                onClick={() => handleLocationSelect(location.member_id)}
              >
                <div className="location-info">
                  <h4>{location.city || 'Unknown City'}</h4>
                  {location.address && <p>{location.address}</p>}
                  {location.distance != null && <p className="distance-info">Distance: {location.distance}</p>}
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
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
