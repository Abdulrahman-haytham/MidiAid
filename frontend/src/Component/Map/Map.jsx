import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';
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
      console.log(e);
      
    },
  });
  return null;
};

const Map = ({ position, setPosition }) => {
    const [city, setCity] = useState('');
  useEffect(() => {
    const getCityName = async () => {
      if (position) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`
          );
          const cityName =
            res.data.address.city ||
            res.data.address.town ||
            res.data.address.village ||
            res.data.address.state;
          setCity(cityName || 'غير معروف');
        } catch (error) {
          console.error('Failed to fetch city name:', error);
          setCity('غير معروف');
        }
      }
    };

    getCityName();
  }, [position]);

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
    <form>
       <div>
          <label>اسم المدينة (يتم تعبئته تلقائيًا):</label>
          <input
            type="text"
            value={city}
            readOnly
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div style={{ height: '', marginTop: '20px' }}>
      {position && (
        <MapContainer center={position} zoom={13} className='m-auto' style={{ height: '67vh', width: '80%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker
            position={position}
            // هاد بيسمحلي انو اسحب ال Marker
            draggable={true}
            // هاد الحدث لما بسحب الايقونة Marker
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                console.log(e,'df');
                
                setPosition(latlng);
              },
            }}
          />
          {/* هي من شان لما بضغط ع الخريطة  */}
          <LocationMarker setPosition={setPosition} /> 
        </MapContainer>
      )}
    </div>
    </form>
    
  );
};

export default Map;
