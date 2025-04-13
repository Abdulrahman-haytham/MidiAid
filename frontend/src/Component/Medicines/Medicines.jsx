import React, { useEffect, useState } from 'react'
import Medicine from './Medicine'
import { Container, Row } from 'react-bootstrap'
import { useGetDataQuery } from '../../redux/feature/api/categories/categoriesApi';
import Cookies from 'universal-cookie';
import { useSelector } from 'react-redux';
import { Fade } from 'react-awesome-reveal';
import Slider from 'react-slick';

const Medicines = () => {
  const prodcts=useSelector(state => state.filterPro.form)
  const { data:pro, error, isLoading } = useGetDataQuery('products/products');
 pro && console.log('dataaaaa', pro);

  const [products,setProducts]=useState([])
  
//     useEffect(()=>{
 
//   const getdata= async ()=>{

//       const res= await axios.get('https://midiaid.onrender.com/api/products/products',
//         {
//           headers: {
//             'Authorization': `Bearer ${cookies.get('token')}`
//           }
//         }
//       )
//     console.log('product',res.data);
//     products &&   setProducts(res.data)
    
//   }
// getdata()
// },[])
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
        slidesToShow: 1,
      }
    }
  ]
};
  useEffect(() => {
    prodcts && setProducts(prodcts)

    console.log('dataaaaa', prodcts);
    
  }, [prodcts]);
  
  if (isLoading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ في جلب البيانات!</p>;


  return (
    
   <Container>
   {/* d-flex justify-content-center col-pro */}
     <div className='px-4'>
        <Slider {...settings}>
        {  products && products?.map((medicine,i)=>(
         <div  key={i} >
          <Medicine   medicine={medicine}/>
          {/* <Medicine   medicine={medicine}/> */}
        </div>

      ))}
        </Slider>
     
   
     </div>
   </Container>
  )
}

export default Medicines