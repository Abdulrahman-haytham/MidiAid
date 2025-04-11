import React, { useEffect, useState } from 'react'
import './Categories.css'
import {  useGetDataQuery } from '../../redux/feature/api/categories/categoriesApi';
import Cookies from 'universal-cookie';
import { Fade } from 'react-awesome-reveal';
const Categories = () => {
  const {data} =   useGetDataQuery('categories/all');
  const [categores,setCategores] = useState([])
  const cookies= new Cookies()
  cookies.get('token')
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
    
      <Fade
              style={{ margin: "auto" }}
              delay={300}
              direction="up"
              triggerOnce={true}
              cascade
            >
     <div className='d-flex justify-content-center align-item-center gap-2'>

      {data && categores?.map((category, index) => ( 
        // تأكد من أن البيانات موجودة قبل التكرار عليها
       <div key={index}>
         <img src={categores?.image} alt="" />
         <p  className='cat'>{category.name} </p> 
       </div>// افترض أن كل فئة تحتوي على خاصية "name"
      ))}
      </div>
      
      </Fade>
    
  )
}

export default Categories