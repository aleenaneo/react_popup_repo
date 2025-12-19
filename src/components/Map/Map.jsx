import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for selected/unselected markers
const getMarkerIcon = (isSelected) => {
  return new L.Icon({
    iconUrl: isSelected 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
      : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

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

// Component to fly to selected location
const MapController = ({ selectedMemberId, locations }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedMemberId && locations) {
      const selectedLoc = locations.find(loc => loc.member_id === selectedMemberId);
      if (selectedLoc) {
        map.panTo(
          [parseFloat(selectedLoc.lat), parseFloat(selectedLoc.lng)], 
          { animate: true, duration: 1.5 }
        );
      }
    }
  }, [selectedMemberId, locations, map]);

  return null;
};

const Map = ({ locations, onLocationSelect, selectedMemberId }) => {
  // Calculate average center of all locations for better map positioning
  const defaultCenter = locations && locations.length > 0
    ? [
        locations.reduce((sum, loc) => sum + parseFloat(loc.lat), 0) / locations.length,
        locations.reduce((sum, loc) => sum + parseFloat(loc.lng), 0) / locations.length
      ]
    : [39.8283, -98.5795]; // Default to center of USA

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
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true} 
      >
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds locations={locations} />
        <MapController selectedMemberId={selectedMemberId} locations={locations} />
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[parseFloat(location.lat), parseFloat(location.lng)]}
            icon={getMarkerIcon(selectedMemberId === location.member_id)}
            eventHandlers={{
              click: () => onLocationSelect(location.member_id)
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
