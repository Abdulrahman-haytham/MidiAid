import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './Component/Utility/Navbar/NavBar';
import HomePage from './Pages/Home/HomePage';
import Footer from './Component/Utility/Footer/Footer';
import RegisterUser from './Pages/Auth/RegisterUser';
import RegisterPha from './Pages/Auth/RegisterPha';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Pages/Auth/Login';
import Verify from './Pages/Auth/Verify';
import ModalEmail from './Pages/Auth/ModalEmail';
import SideBar from './Component/Utility/SideBar/SideBar';
import Favourite from './Component/Favourite/Favourite';
import Cart from './Component/Cart/Cart';
import Orders from './Component/Orders/Orders';
import MedicineDetail from './Component/Medicines/MedicineDetail';
import Cookies from 'universal-cookie';
import { useEffect, useState } from 'react';
import Pharmacy from './Component/Pharmacy/Pharmacy';
import { ToastContainer } from 'react-toastify';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import 'react-toastify/dist/ReactToastify.css';
import KafouPost from './Component/KafouPost/KafouPost';
import Map from './Component/Map/Map';
import Maap from './Component/Map/Maap';
function App() {
  const cookies = new Cookies()
  const [isLoggedIn, setIsLoggedIn] = useState(cookies.get("token"));
  console.log(isLoggedIn);
   
  useEffect(() => {
    // ✅ تحقق تلقائي من حالة تسجيل الدخول عند تحديث `cookies`
    setIsLoggedIn(cookies.get("token"));
}, [cookies.get("token")]); 
 
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <BrowserRouter>
      <NavBar isLoggedIn={isLoggedIn}/>
           <Routes >
                <Route path='/' element={<HomePage />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route path='verify' element={<Verify/>} />
                <Route path='registerUser' element={<RegisterUser />} />
                <Route path='modalEmail' element={<ModalEmail />} />
                <Route path='registerPha' element={<RegisterPha />} />   
                <Route path='favourite' element={<Favourite />} />   
                <Route path='cart' element={<Cart />} />   
                <Route path='orders' element={<Orders />} />   
                <Route path='kafuo' element={<KafouPost />} />   
                <Route path='my-pharmacy' element={<Pharmacy />} />   
                <Route path='map1' element={<Map />} />   
                <Route path='map' element={<Maap />} />   
                <Route path='products/products/:productId' element={<MedicineDetail />} />   
            </Routes>
           {/* </div>
       </div> */}
      
      <Footer/>

      </BrowserRouter>
    </>
  )
}

export default App
