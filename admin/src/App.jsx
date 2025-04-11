import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter  , Routes, Route } from "react-router-dom";
import AllMedicine from './components/AllMedicine';
import axios from 'axios'; 
import Login from './components/Login';
import AllUsers from './components/AllUsers';
import NavBar from './components/NavBar';
import AllPharmacies from './components/AllPharmacies';
import AllCategories from './components/AllCategories';
//to import global var
import './styles/global.css';
function App() {
  // // get all movies
  // const getMovies = async () => {
  //   const res = await axios.get('http://localhost:3000/auth/users');
  //   console.log(res);
  // };

  // useEffect(() => {
  //   getMovies();
  // }, []);

  return (       
         
    <BrowserRouter>

          <div className="d-flex">
        {/* Sidebar */}
        <Sidebar />
        <div className="flex-grow-1">
          {/* Navbar */}
          <NavBar />
      <Routes>
        {/* <Route path="/" element={<Home />}> </Route> */}
        <Route path="/medicines" element={<AllMedicine />} />
        <Route path="/users" element={<AllUsers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pharmacies" element={<AllPharmacies />} />
        <Route path="/categories" element={<AllCategories />} />
        {/* <Route path="/" element={<ProductsPage />} />*/}
        {/* <Route path="/login" element={<Login />} />  */}

      </Routes>
      </div>
      </div>

    </BrowserRouter>
  );
}

export default App;

// function Home() {
//   return <h2>Home component</h2>
// }
// function Order() {
//   return <h2>Order component</h2>
// }
