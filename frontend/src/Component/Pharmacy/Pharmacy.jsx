import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button, Form, Col, Row, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import './Pharmacy.css';
import { useCreateMyParmacyMutation } from '../../redux/feature/api/Api';

const Pharmacy = () => {
  const selectedMedicines = useSelector((state) => state.medicineToPh.form);

  const [createMyPharmacy] = useCreateMyParmacyMutation();

  const [position, setPosition] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [pharmacyData, setPharmacyData] = useState({
    name: '',
    address: '',
    location: { coordinates: [0, 0] },
    phone: '',
    openingHours: '',
    imageUrl: '',
    description: '',
    services: [],
    socialMedia: { facebook: '', instagram: '' },
    website: '',
    medicines: [],
  });

  // Update medicines from Redux store
  useEffect(() => {
    if (selectedMedicines) {
      setPharmacyData((prev) => ({
        ...prev,
        medicines: selectedMedicines,
      }));
    }
  }, [selectedMedicines]);

  // Handle input changes (general fields)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPharmacyData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle social media inputs separately
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setPharmacyData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [name]: value },
    }));
  };

  // Get user's geolocation
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const coordinates = [coords.latitude, coords.longitude];
          setPosition(coordinates);
          setPharmacyData((prev) => ({
            ...prev,
            location: { coordinates },
          }));
          setShowMap(true);
        },
        () => alert('Failed to retrieve location.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createMyPharmacy(pharmacyData).unwrap();
      console.log('Submission Success:', response);
      alert('Pharmacy data submitted successfully!');
    } catch (error) {
      console.error('Submission Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  return (
    <Container>
      <Row className="py-5 justify-content-center align-items-center">
        <Col lg={8} className="form-pharmacy d-flex flex-column align-items-center">
          <Form onSubmit={handleSubmit} className="w-100">

          {/* Basic Info */}
          <Form.Group controlId="formName">
            <Form.Control
              type="text"
              name="name"
              placeholder="Pharmacy Name..."
              value={pharmacyData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formAddress" className='mt-2'>
            <Form.Control
              type="text"
              name="address"
              placeholder="Address..."
              value={pharmacyData.address}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Location Info */}
          <div className="mt-2 w-100">
            <Form.Control
              type="text"
              placeholder="Latitude, Longitude"
              value={position ? position.join(', ') : ''}
              readOnly
              required
            />
            <Button onClick={handleLocation} variant="secondary" className="my-2">
              Get Current Location
            </Button>

            {showMap && position && (
              <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={position}>
                  <Popup>Your selected location</Popup>
                </Marker>
              </MapContainer>
            )}
          </div>

          {/* Contact Info */}
          <Form.Group controlId="formPhone" className='mt-2'>
            <Form.Control
              type="text"
              name="phone"
              placeholder="Phone Number..."
              value={pharmacyData.phone}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formOpeningHours" className='mt-2'>
            <Form.Control
              type="text"
              name="openingHours"
              placeholder="Opening Hours..."
              value={pharmacyData.openingHours}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          {/* Media & Description */}
          <Form.Group controlId="formImageUrl" className='mt-2'>
            <Form.Control
              type="url"
              name="imageUrl"
              placeholder="Image URL..."
              value={pharmacyData.imageUrl}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formDescription" className='mt-2'>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Description..."
              value={pharmacyData.description}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Services */}
          <Form.Group controlId="formServices" className='mt-2'>
            {['Delivery', '24/7 Service', 'Home Delivery'].map((service) => (
              <Form.Check
                key={service}
                type="checkbox"
                label={service}
                value={service}
                checked={pharmacyData.services.includes(service)}
                onChange={(e) => {
                  const { checked, value } = e.target;
                  setPharmacyData((prev) => ({
                    ...prev,
                    services: checked
                      ? [...new Set([...prev.services, value])]
                      : prev.services.filter((s) => s !== value),
                  }));
                }}
              />
            ))}
          </Form.Group>

          {/* Social Media */}
          <Row>
            <Col>
              <Form.Group controlId="formFacebook" className='mt-2'>
                <Form.Control
                  type="url"
                  name="facebook"
                  placeholder="Facebook URL..."
                  value={pharmacyData.socialMedia.facebook}
                  onChange={handleSocialMediaChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formInstagram" className='mt-2'>
                <Form.Control
                  type="url"
                  name="instagram"
                  placeholder="Instagram URL..."
                  value={pharmacyData.socialMedia.instagram}
                  onChange={handleSocialMediaChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Website */}
          <Form.Group controlId="formWebsite" className='mt-2'>
            <Form.Control
              type="url"
              name="website"
              placeholder="Website URL..."
              value={pharmacyData.website}
              onChange={handleInputChange}
            />
          </Form.Group>

          <button variant="primary" type="submit" className="btn-submit mt-3 w-100">
            Submit
          </button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Pharmacy;
