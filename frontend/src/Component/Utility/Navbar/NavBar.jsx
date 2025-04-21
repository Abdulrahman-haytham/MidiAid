import React, { useState, useEffect } from 'react';
import { Button, Container, Form, InputGroup, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap';
import { CiLogin, CiShoppingCart, CiHeart } from "react-icons/ci";
import { BiCart ,BiUser} from "react-icons/bi";
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';
import logo from '../../../assets/logo.png';
import SideBar from '../SideBar/SideBar';
import { MdEmojiPeople,MdFavoriteBorder } from "react-icons/md";
import { IoIosList } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import { LuLogIn } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import { useGetDataQuery, useGetSearchQuery } from '../../../redux/feature/api/Api';
import { useDispatch, useSelector } from 'react-redux';
import './NavBar.css';
import { setSearchTerm } from '../../../redux/feature/slice/SearchSlice';
import { filterProducts } from '../../../redux/feature/slice/ProductsSlice';
import { toast } from 'react-toastify';


function NavBar({ isLoggedIn }) {
  const cookies = new Cookies();
  const dispatch = useDispatch();
  const type = cookies.get('type');
  const name = cookies.get('name') || 'User'; 
  const [show, setShow] = useState(false);
  const dispath = useDispatch();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn);
  const { data: allProducts, error, isLoading } = useGetDataQuery('products/products');
  allProducts && console.log('dataaaaa', allProducts);

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  const searchTerm = useSelector((state) => state.search.searchTerm);
  
  // فلترةةة 
  // const filteredProducts = allProducts?.filter(product =>
  //   product.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  const { data } = useGetSearchQuery(
    searchTerm ? `products/search/b` : ''
  );
  
  // useEffect(() => {
  //   dispath(filterProducts(filteredProducts));
  // data && console.log(data);

  // }, [searchTerm, allProducts]);

 
  // const handleSearchChange = (e) => {
  //   dispatch(setSearchTerm(e.target.value));
  //   console.log('search');
    
  // };

  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();

  //   const trimmedTerm = searchTerm.trim();

  //   if (!trimmedTerm) {
  //     toast.warning("Please enter a search term 🔍");
  //     return;
  //   }

  //   if (allProducts) {
  //     const results = allProducts.filter(product =>
  //       product.name.toLowerCase().includes(trimmedTerm.toLowerCase())
  //     );

  //     dispatch(filterProducts(results));

  //     if (results.length > 0) {
  //       toast.success(`Found ${results.length} result(s) for "${trimmedTerm}" 🎯`);
  //     } else {
  //       toast.error(`No results found for "${trimmedTerm}" 😕`);
  //     }
  //   }
  // };



  return (
    <div style={{ backgroundColor: 'rgb(248, 245, 245)' }}>
      
     
      <Navbar expand="lg">
        <Container  className="d-flex justify-content-between align-items-center">
          
        <Nav.Link as={Link} to="/">
            <img src={logo} alt="MediAid" className="logo" />
        </Nav.Link>

          <div className="d-flex align-items-center  justify-content-between  gap-1">
          <Nav className="d-flex align-items-center flex-row gap-2">

  {/* إنشاء حساب */}
            <NavDropdown
            title={
              <div className="d-flex align-items-center">
                <LuLogIn className="fs-4" />
                <span className="d-none d-lg-inline ms-1">إنشاء حساب</span>
              </div>
            }
            id="nav-dropdown-light-example"
            menuVariant="light"
            align="start"
            className="text-white no-caret"
          >
            <NavDropdown.Item as={Link} to="/registerPha" className='drop-item'>
              صيدلي
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/registerUser" className='drop-item'>
              مستخدم
            </NavDropdown.Item>
          </NavDropdown>
            {/* تسجيل الدخول */}
  <Nav.Link as={Link} to="/login" className="p-0">
    <div className="d-flex align-items-center">
      <BiUser className="fs-4" />
      <span className="d-none d-lg-inline ms-1">دخول</span>
    </div>
  </Nav.Link>


</Nav>


            
          </div>
         
        </Container>
      </Navbar>

      
      <Navbar className="search-bg">
        <Container>
          <div className=" d-flex justify-content-between align-items-center w-100 mx-3">
          
            {/* <p className="welcome">Welcome {name} 👋🏻</p> */}
            {isUserLoggedIn ? (
                 <>
                 <i className="fs-3 text-white col-3" onClick={() => setShow(true)}  style={{ cursor: "pointer" }}>
                   <IoIosList />
                 </i>
                 <Offcanvas show={show} onHide={() => setShow(false)} placement="end">
                   <Offcanvas.Header closeButton>
                     <Offcanvas.Title>😎</Offcanvas.Title>
                   </Offcanvas.Header>
                   <Offcanvas.Body>
                     <SideBar />
                   </Offcanvas.Body>
                 </Offcanvas>
               </>
            ) : (
              <div className=' d-flex justify-content-center align-items-center text-white col-3'>
                 <Nav.Link as={Link} to="/kafuo" title='كُن جزءاً من مجتمع المساعدة' className='kafo'>
            كَفو<MdEmojiPeople />
            </Nav.Link>
          </div>
          
            )}
            
              <div className="flex-grow-1 mx-3 text-center">
                <InputGroup dir='ltr'>
                  <InputGroup.Text id="basic-addon1"><IoSearch/></InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="...بحث"
                    aria-label="Search"
                    aria-describedby="basic-addon1"
                    value={searchTerm}
                    // onChange={handleSearchChange}
                  />
                </InputGroup>
              </div>

            
            <div className="col-2 my-auto icons text-light d-flex justify-content-end align-items-center">
              <Nav.Link as={Link} to="/cart" className="ms-1">
               <BiCart /> 
              </Nav.Link>
              |  
              <Nav.Link as={Link} to="/favourite" className="me-1">
               <MdFavoriteBorder /> 
              </Nav.Link>
            </div>

          </div>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;
