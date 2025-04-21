import React from 'react'
import './Carousel.css'
import {Carousel, Col, Container, Row } from 'react-bootstrap';
// import img1 from '../../../assets/4.jpg'
// import img2 from '../../../assets/7.jpg';
// import img3 from '../../../assets/5.jpg';
import img from '../../../assets/pharmicist.jpg';
import { Fade } from 'react-awesome-reveal';

function Carusel() {
  return (
    // <Carousel fade className='w-100'>
    //   <Carousel.Item className='img-slider w-100 '>
    //       <div className="d-flex flex-row justify-content-center align-items-center">
    //         <img src={img1} alt="" 
    //         // className='w-100'
    //            style={{ height: "296px", width: "313.53px" }}
    //         />
    //      </div>
    //   </Carousel.Item>
    //   <Carousel.Item className='img-slider w-100'>
    //   <div className="d-flex flex-row justify-content-center align-items-center">
    //     <img src={img2} alt=""
    //       // className='w-100'
    //       style={{ height: "296px", width: "313.53px" }}
    //     />
    //     </div>
    //   </Carousel.Item>
    //   <Carousel.Item className='img-slider w-100'>
    //   <div className="d-flex flex-row justify-content-center align-items-center">
    //   <img src={img3} alt=""  
    //   // className='w-100'
    //      style={{ height: "296px", width: "313.53px" }}
    //   />
        
    //     </div>
    //   </Carousel.Item>
    // </Carousel>
      <Container>
        <Row className='d-flex  justify-content-between align-items-between '>
        <Col lg={5} className="txt d-flex justify-content-center align-items-center ">
        
        <Fade
         style={{ margin: "auto" }}
         delay={300}
         direction="right"
         triggerOnce={true}
         cascade
        >
          <div className='mb-2 mt-3'>
          مرحباً بكم في  <span className='mediaid'> MediAid </span> 
        <p>
        {/* Easy medication  searches and a way to connect with those who need assistance! */}
        نحن هنا لمساعدتكم في العثور على الأدوية التي تحتاجونها، 
     بأقرب صيدلية إليكم!

        </p>
          </div>

       
        </Fade>
        </Col>
        <Col lg={7} className="content-img" >
          <img src={img} alt="" className='img' />
        </Col>
      </Row>
    
      </Container>
  )
}

export default Carusel