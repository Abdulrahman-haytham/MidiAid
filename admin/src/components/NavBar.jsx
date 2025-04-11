import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { baseURL } from '../baseURL';
import styles from '../styles/Nav.module.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // تحقق من التوكن عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // دالة لتسجيل الخروج
  const handleLogout = async () => {
    const token =  localStorage.getItem('token');
    if (!token) {
      console.error("No token found, can't logout");
      return;
    }

    try {
      await axios.post(
        `${baseURL}api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,  // تأكد من إرسال التوكن في الهيدر
          },
        }
      );
      localStorage.removeItem('token');  // حذف التوكن من الكوكيز
      setIsLoggedIn(false);  // تحديث حالة الدخول
      navigate('/');  // إعادة التوجيه إلى الصفحة الرئيسية
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <BootstrapNavbar  expand="lg"className={`shadow-lg ${styles.Navbar}`}>
      <BootstrapNavbar.Brand className={`  ${styles.NavText}`}>My Medicine</BootstrapNavbar.Brand>
      <Nav className="ml-auto">
        {/* إذا كان المستخدم قد سجل الدخول، عرض Logout، وإلا عرض Login */}
        {isLoggedIn ? (
          <Nav.Item>
            <button onClick={handleLogout} className={` btn btn-link nav-link text-white ${styles.NavLog}`}>
              Logout
            </button>
          </Nav.Item>
        ) : (
          <Nav.Item>
            <Link to="/login"className={`bi bi-box-arrow-right nav-link text-white ${styles.NavLog}`}>
              Login
            </Link>
          </Nav.Item>
        )}
      </Nav>
    </BootstrapNavbar>
  );
};

export default NavBar;
   

