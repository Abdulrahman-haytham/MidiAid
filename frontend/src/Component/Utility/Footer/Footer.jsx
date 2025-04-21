import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Accordion, AccordionContext, useAccordionButton } from 'react-bootstrap';
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { Link } from 'react-router-dom';
import './Footer.css';
import { useGetDataQuery } from '../../../redux/feature/api/Api';
import img from '../../../assets/logo.png';

// زر أكورديون مخصص
const CustomToggle = ({ children, eventKey }) => {
  const { activeEventKey } = useContext(AccordionContext);
  const isCurrent = activeEventKey === eventKey;
  const decoratedOnClick = useAccordionButton(eventKey);

  return (
    <div onClick={decoratedOnClick} className="custom-toggle d-flex justify-content-between align-items-center px-2">
      {children}
      <span className="plus-icon">{isCurrent ? "−" : "+"}</span>
    </div>
  );
};

// مكون قسم الفوتر المخصص
const FooterSection = ({ title, children }) => (
  <Col md={3} className="mb-3">
    <h5>{title}</h5>
    {children}
  </Col>
);

const Footer = () => {
  const { data } = useGetDataQuery('categories/all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (data) setCategories(data.categories);
  }, [data]);

  const links = [
    { label: 'الرئيسية', url: '/' },
    { label: 'من نحن', url: '#' }
  ];

  const contact = [
    { name: 'فيسبوك', url: 'https://facebook.com', icon: <FaFacebook /> },
    { name: 'تويتر', url: 'https://twitter.com', icon: <FaTwitter /> },
    { name: 'انستاغرام', url: 'https://instagram.com', icon: <IoLogoInstagram /> },
    { name: 'example@email.com', url: 'mailto:example@email.com', icon: <MdEmail /> }
  ];

  return (
    <footer className="footer py-4 mt-5">
      <Container>
        <div className="d-md-none">
        
          <Accordion flush>
            <Accordion.Item eventKey="0">
              <CustomToggle eventKey="0">التصنيفات</CustomToggle>
              <Accordion.Body>
                {categories.map((cat, idx) => (
                  <div key={idx}>{cat.name}</div>
                ))}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <CustomToggle eventKey="1">روابط</CustomToggle>
              <Accordion.Body>
                {links.map((link, idx) => (
                  <div key={idx}>
                    <Link to={link.url} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      {link.label}
                    </Link>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <CustomToggle eventKey="2">تواصل معنا</CustomToggle>
              <Accordion.Body>
                {contact.map((item, idx) => (
                  <div key={idx} style={{ height: '42px' }}>
                    <i className="footer-icon fs-5 me-2">{item.icon}</i>
                    <a href={item.url} className="text-dark" target="_blank" rel="noreferrer">
                      {item.name}
                    </a>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        <Row className="d-none d-md-flex align-items-start">
          <Col md={2}>
            <img src={img} alt="logo" className="img-fluid" />
          </Col>

          <FooterSection title="التصنيفات">
            <ul className="list-unstyled">
              {categories.map((cat, idx) => (
                <li key={idx} className="footer-shroot">{cat.name}</li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title="روابط">
            <ul className="list-unstyled">
              {links.map((item, idx) => (
                <li key={idx} className="footer-shroot">
                  <Link to={item.url} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* عمود تواصل معنا */}
          <FooterSection title="تواصل معنا">
            <ul className="list-unstyled">
              {contact.map((item, idx) => (
                <li key={idx} style={{ height: '42px' }}>
                  <i className="footer-icon fs-5 me-2">{item.icon}</i>
                  <a href={item.url} className="text-dark" target="_blank" rel="noreferrer">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </FooterSection>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
