import React, { useEffect, useState } from 'react';
import MapComponent from './Map';
import axios from 'axios';

function Maap() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState(null);
  const [city, setCity] = useState('');

  // عند تغيير الموقع، احصل على اسم المدينة
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name,
      phone,
      location: position,
      city,
    });
    alert('تم إرسال الطلب! تحقق من الكونسول 👀');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>🛵 طلب توصيل</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>الاسم:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>رقم الهاتف:</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>اسم المدينة (يتم تعبئته تلقائيًا):</label>
          <input
            type="text"
            value={city}
            readOnly
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <MapComponent position={position} setPosition={setPosition} />

        <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
          إرسال الطلب
        </button>
      </form>
    </div>
  );
}

export default Maap;
