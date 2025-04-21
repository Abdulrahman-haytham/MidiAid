import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner, Alert, Form } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input/input';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../redux/feature/api/authApi';
import { useDispatch } from 'react-redux';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Fade } from 'react-awesome-reveal';
import Map from '../../Component/Map/Map';
import { useUploadImgMutation } from '../../redux/feature/api/uploadImage/uploadImage';

const RegisterPha = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const cookies = new Cookies();
  const [signup, { isLoading }] = useSignupMutation();

  const [imge, setImage] = useState('');
  const [uploadImage]= useUploadImgMutation()
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
    formData.append('file', file);

    try {
      const res = await uploadImage(formData).unwrap()
      console.log(res);
      
      setImageUrl(res?.data);
    } catch (error) {
      console.log(error);
      
      toast.error('Failed to upload image.');
    }
  };

  useEffect(() => {
    if (position) {
      setCoordinates([position.lat, position.lng]);
    }
  }, [position]);


  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { firstName, lastName, email, password, phone, address } = userData;

    if (!firstName || !lastName || !email || !password || !phone || !address ) {
      setErrorMessage('Please fill in all fields correctly.');
      return;
    }

    const form = {
      ...userData,
      location: { type: 'Point', coordinates: [8.9, 9.7] },
      type: 'pharmacist',
      username: firstName + lastName,
      license: url,
    };

    try {
      const response = await signup(form).unwrap();
   if (response?.user) {
        toast.success('تم التسجيل بنجاح! سيتم تحويلك...');
        setTimeout(() => navigate('/verify'), 2000);
      }
    } catch (err) {
      console.error('خطأ أثناء التسجيل:', err);
      toast.error(err?.data?.message || 'حدث خطأ أثناء التسجيل. حاول لاحقاً.');
    }
  };

  return (
    <Container style={{ minHeight: '670px' }}>
      <Fade delay={300} direction="up" triggerOnce cascade>
        <Row className="py-5  d-flex justify-content-center align-items-center mx-1">
          <Col xs={12} md={10} lg={6} className="logn">
            <label className="mx-auto title-login">إنشاء حساب</label>

            <form onSubmit={handleRegister} className="w-100">
              <Row>
                <Col xs={12} md={6}>
                  <input name="firstName" value={userData.firstName} placeholder="الاسم الأول" type="text" className="user-input" onChange={handleChange} required />
                </Col>
                <Col xs={12} md={6}>
                  <input name="lastName" value={userData.lastName} placeholder="الاسم الأخير" type="text" className="user-input" onChange={handleChange} required />
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <input name="email" value={userData.email} placeholder="الايميل" type="email" className="user-input" onChange={handleChange} required />
                </Col>
                <Col xs={12}>
                  <input name="password" value={userData.password} placeholder="كلمة السر" type="password" className="user-input" onChange={handleChange} required />
                </Col>
                <Col xs={12}>
                  <PhoneInput placeholder="رقم الهاتف"
                     value={userData.phone}
                     onChange={handlePhoneChange}
                     style={{ direction: 'rtl', textAlign: 'right' }}
                     className="user-input  "
                     required />
                </Col>
                <Col xs={12}>
                  <input name="address" value={userData.address} placeholder="العنوان" type="text" className="user-input" onChange={handleChange} required />
                </Col>
              </Row>

                {/* <label htmlFor="file-upload" className="custom-file-upload btn btn-secondary">
                  Upload License
                </label> */}
             <Form.Group controlId="formFileLg">
              <Form.Label style={{ direction: 'rtl', textAlign: 'right' }}>
                قم برفع صورة لشهادة الصيدلة
              </Form.Label>
              <Form.Control
                type="file"
                size="lg"
                onChange={handleImageUpload}
                className="user-input"
                style={{ display: 'block' }}
                required
              />
            </Form.Group>

              {/* <div className="mt-3">
                {/* <input type="text" value={coordinates.join(', ')} readOnly placeholder="Select your location from the map" className="user-input" /> * /}
                <Button onClick={handleLocation} variant="secondary" className="btn my-2 w-50 mx-auto">📍 Location</Button>

              
                {showMap && <Map position={position} setPosition={setPosition} />}
              </div> */}

              <button type="submit" className="btn-submit mx-auto mt-4 w-100" disabled={isLoading}>
                {isLoading ? <Spinner animation="border" size="sm" /> : 'إنشاء حساب'}
              </button>
            </form>

            {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}

            <label className="mx-auto my-4">
              هل لديك حساب بالفعل ؟ <Link to="/login" style={{ textDecoration: 'none' }}><span className="text-danger">تسجيل دخول</span></Link>
            </label>
          </Col>
        </Row>
      </Fade>
    </Container>
  );
};

export default RegisterPha;
