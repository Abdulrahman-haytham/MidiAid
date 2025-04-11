import React from 'react'
// import { Container } from 'react-bootstrap'
import  './SubTitle.css'
import { Link } from 'react-router-dom'
const SubTitle = ({title,icon,btnTitle,path}) => {
  return (
       
           <div className="container d-flex justify-content-between pt-3 mb-3">
              <div className='d-flex '>
            <div className='text-title me-2'>{title }</div><span className='fs-3'>{icon}</span>

              </div>
              { btnTitle ? <Link to={path}  className='btn-title py-1 px-3'>
            {btnTitle}
              </Link>
              :null           
                }
           </div>

  )
}

export default SubTitle