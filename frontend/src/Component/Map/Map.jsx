import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

const Map = ({ position, setPosition }) => {
  useEffect(() => {
    if (!position) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Error getting location', err);
        }
      );
    }
  }, [position, setPosition]);

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      {position && (
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                setPosition(latlng);
              },
            }}
          />
          <LocationMarker setPosition={setPosition} />
        </MapContainer>
      )}
    </div>
  );
};

export default Map;
