import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input/input';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../redux/feature/api/authApi';
import { useDispatch } from 'react-redux';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Fade } from 'react-awesome-reveal';
import Map from '../../Component/Map/Map';

const RegisterPha = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const cookies = new Cookies();
  const [signup, { isLoading }] = useSignupMutation();

  const [imge, setImage] = useState('');
  const [url, setImageUrl] = useState('');
  const [position, setPosition] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [city, setCity] = useState('');

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const [showMap, setShowMap] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setUserData({ ...userData, phone: value });
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const newPos = { lat: coords.latitude, lng: coords.longitude };
          setPosition(newPos);
          setShowMap(true);
        },
        () => alert('Failed to get location.')
      );
    } else {
      alert('Geolocation is not supported by this device.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('https://midiaid.onrender.com/api/uploads/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImageUrl(res.data.data);
    } catch (error) {
      toast.error('Failed to upload image.');
    }
  };

  useEffect(() => {
    if (position) {
      setCoordinates([position.lat, position.lng]);
    }
  }, [position]);

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { firstName, lastName, email, password, phone, address } = userData;

    if (!firstName || !lastName || !email || !password || !phone || !address || !position) {
      setErrorMessage('Please fill in all fields correctly.');
      return;
    }

    const form = {
      ...userData,
      location: { type: 'Point', coordinates: [position.lat, position.lng] },
      type: 'pharmacist',
      username: firstName + lastName,
      license: url,
    };

    try {
      const response = await signup(form).unwrap();

      if (response?.user) {
        toast.success('Registration successful! Redirecting...');
        setTimeout(() => navigate('/verify'), 2000);
        return;
      }

      if (response?.error) {
        if (response.error.status === 400) {
          toast.error('Invalid registration details.');
        } else if (response.error.status === 409) {
          toast.error('Email or phone already registered.');
        } else if (response.error.status === 500) {
          toast.error('Server error, please try again later.');
        } else {
          setErrorMessage('Registration failed. Please check your details.');
        }
      }
    } catch (err) {
      console.error('Registration Error:', err);
      toast.error('An error occurred during registration. Please try again.');
    }
  };

  return (
    <Container style={{ minHeight: '670px' }}>
      <Fade delay={300} direction="up" triggerOnce cascade>
        <Row className="py-5  d-flex justify-content-center align-items-center mx-1">
          <Col xs={12} md={10} lg={6} className="logn">
            <label className="mx-auto title-login">Sign Up</label>

            <form onSubmit={handleRegister} className="w-100">
              <Row>
                <Col xs={12} md={6}>
                  <input name="firstName" value={userData.firstName} placeholder="First Name" type="text" className="user-input" onChange={handleChange} required />
                </Col>
                <Col xs={12} md={6}>
                  <input name="lastName" value={userData.lastName} placeholder="Last Name" type="text" className="user-input" onChange={handleChange} required />
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <input name="email" value={userData.email} placeholder="Email" type="email" className="user-input" onChange={handleChange} required />
                </Col>
                <Col xs={12}>
                  <input name="password" value={userData.password} placeholder="Password" type="password" className="user-input" onChange={handleChange} required />
                </Col>
                <Col xs={12}>
                  <PhoneInput placeholder="Enter phone number" value={userData.phone} onChange={handlePhoneChange} className="user-input" required />
                </Col>
                <Col xs={12}>
                  <input name="address" value={userData.address} placeholder="Your Address" type="text" className="user-input" onChange={handleChange} required />
                </Col>
              </Row>

              <div className="mt-2">
                <label htmlFor="file-upload" className="custom-file-upload btn btn-secondary">
                  Upload License
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  required
                />
              </div>

              <div className="mt-3">
                <input type="text" value={coordinates.join(', ')} readOnly placeholder="Select your location from the map" className="user-input" />
                <Button onClick={handleLocation} variant="secondary" className="btn my-2 w-100">📍 Location</Button>

                <div>
                  <label>City Name  (Automaticy):</label>
                  <input type="text" value={city} readOnly className="user-input" />
                </div>

                {showMap && <Map position={position} setPosition={setPosition} />}
              </div>

              <button type="submit" className="btn-submit mx-auto mt-4 w-100" disabled={isLoading}>
                {isLoading ? <Spinner animation="border" size="sm" /> : 'Sign Up'}
              </button>
            </form>

            {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}

            <label className="mx-auto my-4">
              Already have an account? <Link to="/login" style={{ textDecoration: 'none' }}><span className="text-danger">Login</span></Link>
            </label>
          </Col>
        </Row>
      </Fade>
    </Container>
  );
};

export default RegisterPha;
