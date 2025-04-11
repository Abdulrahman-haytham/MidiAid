import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { FaFacebook , FaPhoneAlt,FaTwitter } from "react-icons/fa";
import {  MdEmail } from "react-icons/md";

import './Footer.css'
const Footer = () => {
  return (
    <div className="footer-background footer  pt-2" style={{ height: "60px" }}>
    <Container className="">
        <Row className="d-flex justify-content-between align-items-center">
            <Col sm="6" className="d-flex align-items-center ">
                <div className="footer-shroot ">الشروط والاحكام</div>
                <div className="footer-shroot mx-2">سيايه الخصوصيه</div>
                <div className="footer-shroot mx-2">اتصل بنا</div>
            </Col>
            <Col
                sm="6"
                className="d-flex justify-content-end align-items-center ">
                <div className="d-flex  justify-content-center align-items-center">
                    <div className='footer-icon fs-5'>
                       <FaPhoneAlt />
                    </div>
                    {/* <p className="footer-phone ">0122455346356</p> */}
                </div>
                <div style={{ cursor: "pointer" }}>
                <div className='footer-icon fs-5'>
                       <MdEmail />
                    </div>
                </div>
                <div style={{ cursor: "pointer" }} className="">
                <div className='footer-icon fs-5'>
                       <FaFacebook />
                    </div>
                </div>
                <div style={{ cursor: "pointer" }} className="">
                <div className='footer-icon fs-5'>
                       <FaTwitter />
                </div>
                </div>
            </Col>
        </Row>
    </Container>
</div>
  )
}

export default Footer