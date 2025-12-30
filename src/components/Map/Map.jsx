import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useLoadScript, GoogleMap, Marker as GMarker, InfoWindow } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { getGoogleMapsApiKey } from '../../api/apiConfig';

// Leaflet marker icon fix and helpers (kept for fallback)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getLeafletMarkerIcon = (isSelected) => {
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

// Leaflet helpers
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

const MapLeaflet = ({ locations, onLocationSelect, selectedMemberId }) => {
  const defaultCenter = locations && locations.length > 0
    ? [
        locations.reduce((sum, loc) => sum + parseFloat(loc.lat), 0) / locations.length,
        locations.reduce((sum, loc) => sum + parseFloat(loc.lng), 0) / locations.length
      ]
    : [39.8283, -98.5795];

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds locations={locations} />
        {locations.map((location, index) => (
          <Marker
            key={`${location.member_id || 'no-id'}-${index}`}
            position={[parseFloat(location.lat), parseFloat(location.lng)]}
            icon={getLeafletMarkerIcon(selectedMemberId === location.member_id)}
            eventHandlers={{ click: () => onLocationSelect(location.member_id) }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

// Google Maps implementation
const MapGoogle = ({ locations, onLocationSelect, selectedMemberId }) => {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey, libraries: ['places'] });
  const mapRef = useRef(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const center = useMemo(() => {
    if (!locations || locations.length === 0) return { lat: 39.8283, lng: -98.5795 };
    const lat = locations.reduce((s, l) => s + parseFloat(l.lat), 0) / locations.length;
    const lng = locations.reduce((s, l) => s + parseFloat(l.lng), 0) / locations.length;
    return { lat, lng };
  }, [locations]);

  useEffect(() => {
    if (isLoaded && locations && locations.length > 0 && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(loc => bounds.extend({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }));
      mapRef.current.fitBounds(bounds);
    }
  }, [isLoaded, locations]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (loadError) {
    console.error('Google Maps failed to load:', loadError);
    return <div className="map-container"><div className="map-empty"><p>Failed to load Google Maps</p></div></div>;
  }

  if (!isLoaded) {
    return <div className="map-container"><div className="map-empty"><p>Loading map…</p></div></div>;
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%', borderRadius: '12px' }}
        center={center}
        zoom={13}
        onLoad={onLoad}
      >
        {locations.map(loc => (
          <GMarker
            key={loc.member_id}
            position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
            onClick={() => { setActiveMarker(loc.member_id); onLocationSelect(loc.member_id); }}
          />
        ))}

        {activeMarker && (() => {
          const loc = locations.find(l => l.member_id === activeMarker);
          if (!loc) return null;
          return (
            <InfoWindow
              position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div>
                <strong>Location</strong>
                <div>Member: {loc.member_id}</div>
              </div>
            </InfoWindow>
          );
        })()}
      </GoogleMap>
    </div>
  );
};

const Map = ({ locations, onLocationSelect, selectedMemberId }) => {
  const apiKey = getGoogleMapsApiKey();

  // Debug: log whether API key was detected
  try {
    console.info('Map: Google Maps API key detected:', Boolean(apiKey));
  } catch (e) {
    // console may be undefined in some environments
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="map-container">
        <div className="map-empty">
          <p>No locations available</p>
        </div>
      </div>
    );
  }

  // If API key is available, use Google Maps; otherwise fallback to Leaflet
  if (apiKey) {
    return <MapGoogle locations={locations} onLocationSelect={onLocationSelect} selectedMemberId={selectedMemberId} />;
  }

  return <MapLeaflet locations={locations} onLocationSelect={onLocationSelect} selectedMemberId={selectedMemberId} />;
};

export default Map;
