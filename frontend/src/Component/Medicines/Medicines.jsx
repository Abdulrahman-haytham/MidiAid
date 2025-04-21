import React, { useEffect, useState } from 'react';
import Medicine from './Medicine';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useGetDataQuery } from '../../redux/feature/api/Api';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Medicines = () => {
  // const prodcts = useSelector(state => state.filterPro.form);
  const { data: pro, error, isLoading } = useGetDataQuery('products/products');
  const [products, setProducts] = useState([]);

  const settings = {
    className: "center",
    infinite: true,
    // centerPadding: "60px",
    slidesToShow: 4,
    dots: false,
    autoplay: false,
    speed: 4000,
    autoplaySpeed: 2000,
    swipeToSlide: true,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          infinite: true,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.5,
        }
      }
    ]
  };

  // useEffect(() => {
  //   prodcts && setProducts(prodcts);
  // }, [prodcts]);

  if (error) return <p>حدث خطأ في جلب البيانات!</p>;

  return (
    <Container >
      <div className='px-2 my-4'>
        {isLoading ? (
          <Row>
            {[...Array(4)].map((_, i) => (
              <Col lg={3} md={4} sm={6} xs={12} key={i} className='mb-4'>
                <Card className='card-pro h-100'>
                  <Skeleton height={150} className='img-pro' />

                  <Card.Body>
                    <div className='d-flex justify-content-between mb-2'>
                      <Skeleton width={24} height={24} circle />
                      <Skeleton width={24} height={24} circle />
                    </div>
                    <Skeleton height={20} className='mb-2' />
                    <Skeleton height={15} width={'80%'} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Slider {...settings} className='slider'>
            {pro && pro.map((medicine, i) => (
              <div key={i}>
                <Medicine medicine={medicine} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </Container>
  );
};

export default Medicines;
