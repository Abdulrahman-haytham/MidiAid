import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Form, Modal, Spinner } from 'react-bootstrap';
import { FaHeart, FaCartPlus } from "react-icons/fa";
import image from '../../assets/pro12.png';
import { useAddToCartMutation, useAddToFavMutation, useRemoveFromCartMutation } from '../../redux/feature/api/categories/categoriesApi';
import Cookies from 'universal-cookie';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addMedicine } from '../../redux/feature/slice/MedicinetoPhaSlice';
import { toast } from 'react-toastify';
import {Fade} from 'react-awesome-reveal'
import './Medicines.css'
const Medicine = ({ medicine }) => {
  const cookies = new Cookies();
  const userType = cookies.get('type');
  const dispatch = useDispatch();

  const [addToFav] = useAddToFavMutation(); 
  const [addToCart] = useAddToCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation(); 

  const [isFavorited, setIsFavorited] = useState(false); 
  const [isInCart, setIsInCart] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    medicineId: medicine?._id,
    quantity: '',
    price: ''
  });

  const handleInputChange = useCallback((field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addToFavourite = () => {
    if (!isFavorited) {
      setLoadingFav(true);
      addToFav(medicine?._id)
        .unwrap()
        .then(() => {
          setIsFavorited(true);
          toast.success('Added to favorites');
        })
        .catch(() => toast.error('Failed to add to favorites'))
        .finally(() => setLoadingFav(false));
    }
  };

  const addToCartHandler = () => {
    if (!isInCart) {
      setLoadingCart(true);
      addToCart(medicine?._id)
        .unwrap()
        .then(() => {
          setIsInCart(true);
          toast.success("Added to cart");
        })
        .catch(() => toast.error("Failed to add to cart"))
        .finally(() => setLoadingCart(false));
    } else {
      if (window.confirm("Are you sure you want to remove this item from your cart?")) {
        setLoadingCart(true);
        removeFromCart(medicine?._id)
          .unwrap()
          .then(() => {
            setIsInCart(false);
            toast.success("Removed from cart");
          })
          .catch(() => toast.error("Failed to remove from cart"))
          .finally(() => setLoadingCart(false));
      }
    }
  };

  const addToPharmacy = () => {
    const { medicineId, price, quantity } = form;

    if (!medicineId || !price || !quantity || price <= 0 || quantity <= 0) {
      toast.warn("Please enter valid price and quantity");
      return;
    }

    dispatch(addMedicine({
      medicineId,
      price: Number(price),
      quantity: Number(quantity)
    }));

    handleClose();
    toast.success("Medicine added to pharmacy");
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
   
  
     <>
       <Card className='card-pro me-1'  >
        <Link to={`/products/products/${medicine?._id}`}>
          <Card.Img variant='top' src={image} className='img-pro' />
        </Link>
        <div className='px-2'>
          <div className='icon-container'>
            <i className='icon-card-heart' onClick={addToFavourite}>
              {loadingFav ? <Spinner animation="border" size="sm" /> : <FaHeart color={isFavorited ? 'red' : 'gray'} />}
            </i>
            <i className='icon-card-cart' onClick={addToCartHandler}>
              {loadingCart ? <Spinner animation="border" size="sm" /> : <FaCartPlus color={isInCart ? 'green' : 'gray'} />}
            </i>
          </div>
          <h5 className='text-danger fs-5'>{medicine?.name}</h5>
          <Card.Text>
            {medicine?.description?.length <= 44 ? medicine?.description : `${medicine?.description?.slice(0, 45)}...`}
          </Card.Text>
        </div>
        <Fade
          className="w-100 text-center"
          delay={0}
          direction="up"
          triggerOnce={true}
          cascade
        >
        <div className="d-flex justify-content-between align-items-center px-2 mb-2 mt-auto">
          <p className='price'>${medicine?.price}</p>
        </div>
        </Fade>

        {userType === 'pharmacist' && (
          <button onClick={handleShow} className='btn btn-outline-dark mx-2 mb-1'>Add to My Pharmacy</button>
        )}
      </Card>

      <Modal centered show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Medicine to Pharmacy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="number"
              placeholder="Enter quantity..."
              value={form.quantity}
              className="my-2"
              onChange={e => handleInputChange('quantity', Number(e.target.value))}
              required
              min={1}
            />
            <Form.Control
              type="number"
              placeholder="Enter price..."
              value={form.price}
              className="my-2"
              onChange={e => handleInputChange('price', Number(e.target.value))}
              required
              min={1}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button variant="secondary"   onClick={handleClose} style={{width:'80px'}}>Close</button>
          <button  className='btn-submit' onClick={addToPharmacy} style={{width:'80px'}}>Save</button>
        </Modal.Footer>
      </Modal>
     </>
    
  );
};

export default Medicine;
