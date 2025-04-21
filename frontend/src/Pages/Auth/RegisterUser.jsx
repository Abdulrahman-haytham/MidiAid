import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input/input';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../redux/feature/api/authApi';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import { Fade } from 'react-awesome-reveal';
import Map from '../../Component/Map/Map';

const RegisterUser = () => {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const [signup, { isLoading }] = useSignupMutation();

  const [position, setPosition] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [showMap, setShowMap] = useState(false);

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setUserData({ ...userData, phone: value });
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast.warn('المتصفح لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const newPos = { lat: coords.latitude, lng: coords.longitude };
        setPosition(newPos);
        setShowMap(true);
        toast.info('تم تحديد الموقع بنجاح 📍');
      },
      () => toast.error('فشل في تحديد الموقع الجغرافي 😢')
    );
  };

  useEffect(() => {
    if (position) {
      setCoordinates([position.lat, position.lng]);
    }
  }, [position]);

  const handleRegister = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, phone, address } = userData;

    if (!firstName || !lastName || !email || !password || !phone || !address) {
      toast.warn('يرجى ملء جميع الحقول.');
      return;
    }

    if (!position) {
      toast.warn('يرجى تحديد الموقع الجغرافي.');
      return;
    }

    const form = {
      ...userData,
      username: firstName + lastName,
      location: { type: 'Point', coordinates: [position.lat, position.lng] },
      type: 'user',
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
    <Container style={{ minHeight: '670px', direction: 'rtl', textAlign: 'right' }}>
      <Fade delay={300} direction="up" triggerOnce cascade>
        <Row className="py-5 justify-content-center mx-1">
          <Col xs={12} md={10} lg={6} className="logn">
            <h4 className="text-center mb-4 title-login">إنشاء حساب جديد</h4>

            <form onSubmit={handleRegister}>
              <Row>
                <Col md={6}>
                  <input
                    name="firstName"
                    value={userData.firstName}
                    placeholder="الاسم الأول"
                    className="user-input"
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={6}>
                  <input
                    name="lastName"
                    value={userData.lastName}
                    placeholder="اسم العائلة"
                    className="user-input"
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <input
                    name="email"
                    type="email"
                    value={userData.email}
                    placeholder="البريد الإلكتروني"
                    className="user-input"
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col xs={12}>
                  <input
                    name="password"
                    type="password"
                    value={userData.password}
                    placeholder="كلمة المرور"
                    className="user-input"
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col xs={12}>
                  <PhoneInput
                    placeholder="رقم الهاتف"
                    value={userData.phone}
                    onChange={handlePhoneChange}
                    className="user-input"
                    style={{ direction: 'rtl' }}
                    required
                  />
                </Col>
                <Col xs={12}>
                  <input
                    name="address"
                    value={userData.address}
                    placeholder="العنوان"
                    className="user-input"
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              {/* تحديد الموقع */}
              {/* <div className="mt-3">
                <input
                  type="text"
                  value={coordinates.join(', ')}
                  readOnly
                  placeholder="إحداثيات الموقع"
                  className="user-input"
                />
                <Button onClick={handleLocation} variant="secondary" className="btn my-2 w-100">
                  📍 تحديد الموقع
                </Button>

                {showMap && position && <Map position={position} setPosition={setPosition} />}
              </div> */}

              <button
                type="submit"
                className="btn-submit mx-auto mt-4 w-100"
                disabled={isLoading}
              >
                {isLoading ? <Spinner animation="border" size="sm" /> : 'إنشاء حساب'}
              </button>
            </form>

            <div className="text-center mt-4">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-danger text-decoration-none">
                تسجيل الدخول
              </Link>
            </div>
          </Col>
        </Row>
      </Fade>
    </Container>
  );
};

export default RegisterUser;
