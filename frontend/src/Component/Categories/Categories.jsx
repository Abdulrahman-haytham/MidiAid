import React, { useEffect, useState } from 'react'
import './Categories.css'
import {  useGetDataQuery } from '../../redux/feature/api/Api';
import Cookies from 'universal-cookie';
import { Fade } from 'react-awesome-reveal';
import defImg from '../../assets/7.jpg'
import { Col, Row } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
const Categories = () => {
  const {data,isLoading} =   useGetDataQuery('categories/all');
  const [categores,setCategores] = useState([])
  const cookies= new Cookies()
  // cookies.get('token')
  useEffect(()=>{
  data &&  setCategores(data.categories) 
  data &&   console.log(data.categories);

  },[data])
  

// useEffect(()=>{
 
//   const getdata= async ()=>{

//       const res= await axios.get('https://midiaid.onrender.com/api/products/products',
//         {
//           headers: {
//             'Authorization': `Bearer ${cookies.get('token')}`
//           }
//         }
//       )
//     console.log('product',res);
    
//   }
// getdata()
// },[])
  return (
   
      // <Fade
      //         style={{ margin: "auto" }}
      //         delay={300}
      //         direction="up"
      //         triggerOnce={true}
      //         cascade
      //       >
    <Row className='d-flex justify-content-center align-item-center gap-2 py-3'>
  {isLoading ? (
    // عرض سكلتون وقت التحميل
    [...Array(6)].map((_, i) => (
      <Col lg={2} sm={2} md={2} key={i} className='cat' >
        <Skeleton height={100} className="cat-img" style={{boxShadow:'none'}} />
        <Skeleton width={80} className="text-cat mt-2" />
      </Col>
    ))
  ) : (
    // عرض الداتا وقت الجاهزية
    categores?.map((category, index) => (
      <Col lg={2} sm={2} md={2} key={index} className='cat'>
        <img src={ defImg} alt="" className='cat-img' />
        <p className='text-cat'>{category.name}</p>
      </Col>
    ))
  )}
</Row>

      
      // </Fade>
    
  )
}

export default Categories