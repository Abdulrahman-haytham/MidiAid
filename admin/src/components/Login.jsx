
 import React, { useEffect, useState } from 'react'
 import { Link, useNavigate } from 'react-router-dom'
 import { Col, Container, Row, Spinner } from 'react-bootstrap'
import styles from '../styles/Login.module.css';
import axios from 'axios'
import { baseURL } from '../baseURL'
 const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
   const navigate=useNavigate()
    const handleLogin = async (e) => {
      const form={
        email,
        password
      }
        e.preventDefault();
        try {
          const response = await axios.post(`${baseURL}api/auth/login`,form)
          console.log("تم تسجيل الدخول:", response);
          // console.log(response?.data.token);
          localStorage.setItem('token',response?.data.token)
          navigate("/");
       
        } catch (err) {
          console.error("خطأ في تسجيل الدخول:", err);
        }
      };
   
    return (
     <Container  >
     <Row className=" d-flex justify-content-center align-items-center "  style={{ minHeight: "80vh" }}>
         <Col sm="6" lg="6" className={`logn my-4 d-flex flex-column align-items-center  ${styles.login}`}>
         {/* <img src={img} alt='' style={{borderRadius:'50%',width:'150px',height:'150px'}}/> */}
             <label className={` mx-auto title-login ${styles.loginText}`} > Login  </label>
             <form onSubmit={handleLogin} className={` ${styles.loginField}`}>
             <input
                 value={email}
                 placeholder=" email"
                 type="email"
                  className={` user-input my-3 pe-2 w-100 ${styles.loginField}`}
                 onChange={(e) => setEmail(e.target.value)}
             />
             <input
               value={password}
                 placeholder="password"
                 type="password"
                 className={` user-input my-3 pe-2 w-100 ${styles.loginField}`}
                 onChange={(e) => setPassword(e.target.value)}
             />
             <button type='submit' className={` btn-login mx-auto mt-4 w-100 ${styles.loginBut}`}>
              Log in
                </button>

             </form>
             {/* <label className="mx-auto my-4">
             if you don't have an account?{" "}
                 <Link to="/register" style={{ textDecoration: 'none' }}>
                     <span style={{ cursor: "pointer" }} className="text-danger">
                        click here
                     </span>
                 </Link>
             </label> */}
 
             {/* {(isLoading === true ? (<Loader/>): null) } */}
 
 
         </Col>
 
 
 
     </Row>
     {/* <ToastContainer/> */}
 </Container>
   )
 }
 
 export default Login