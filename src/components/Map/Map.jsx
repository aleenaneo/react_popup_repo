import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to fit bounds when locations change
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = locations.map(loc => [parseFloat(loc.lat), parseFloat(loc.lng)]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const Map = ({ locations, onLocationSelect, selectedMemberId }) => {
  const defaultCenter = locations && locations.length > 0
    ? [parseFloat(locations[0].lat), parseFloat(locations[0].lng)]
    : [28.6139, 77.2090]; // Default to Delhi, India

  if (!locations || locations.length === 0) {
    return (
      <div className="map-container">
        <div className="map-empty">
          <p>No locations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds locations={locations} />
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[parseFloat(location.lat), parseFloat(location.lng)]}
            eventHandlers={{
              click: () => onLocationSelect(location.member_id)
            }}
          >
            <Popup>
              <div className="map-popup">
                <h4>Service Location {index + 1}</h4>
                <p>Member ID: {location.member_id}</p>
                <button
                  className="select-location-btn"
                  onClick={() => onLocationSelect(location.member_id)}
                >
                  {selectedMemberId === location.member_id ? 'Selected ✓' : 'Select Location'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
