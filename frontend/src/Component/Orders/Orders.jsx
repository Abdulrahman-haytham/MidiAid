import React, { useEffect, useState, useCallback } from 'react';
import { Button, Form, Modal, Table, Alert, Dropdown, DropdownButton } from 'react-bootstrap';
import './Orders.css';
import { useAddOrderMutation, useGetOrdersQuery } from '../../redux/feature/api/categories/categoriesApi';

const Orders = () => {
  const [show, setShow] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    pharmacy: '',
    type: '',
    items: [{ quantity: '' }],
    totalPrice: '',
    deliveryAddress: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  
  const { data: orders = [] } = useGetOrdersQuery();
  const [addOrder] = useAddOrderMutation();

  const handleClose = useCallback(() => {
    setShow(false);
    setErrorMessage('');
    resetForm();
  }, []);

  const handleShow = useCallback(() => setShow(true), []);

  const resetForm = useCallback(() => {
    setOrderDetails({ pharmacy: '', type: '', items: [{ quantity: '' }], totalPrice: '', deliveryAddress: '' });
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleItemQuantityChange = useCallback((index, value) => {
    setOrderDetails(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index].quantity = value;
      return { ...prev, items: updatedItems };
    });
  }, []);

  const createOrder = async () => {
    if (!orderDetails.pharmacy || !orderDetails.type || (orderDetails.type === 'delivery' && !orderDetails.deliveryAddress)) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    try {
      await addOrder(orderDetails).unwrap();
      handleClose();
    } catch (error) {
      setErrorMessage(error?.data?.error || 'Failed to add order. Please try again.');
    }
  };

  return (
    <div className='text-center px-2' style={{ height: '100vh', paddingTop: '50px' }}>
      <Button className='btn-order my-5 p-2' variant='none' onClick={handleShow}>+ Add Order</Button>
      <Table striped bordered hover variant="light">
        <thead>
          <tr>
            <th>#</th>
            <th>Pharmacy</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id || index}>
              <td>{index + 1}</td>
              <td>{order.pharmacy}</td>
              <td>{order.type}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal size="lg" centered show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form>
            <Form.Control type="text" placeholder="Pharmacy..." value={orderDetails.pharmacy} className="my-2" onChange={e => handleInputChange('pharmacy', e.target.value)} required />
            <DropdownButton title={orderDetails.type || "Select Type"} onSelect={type => handleInputChange('type', type)} variant='none' className="my-2 btn-order p-0 bg-light">
              <Dropdown.Item  eventKey="delivery" className='drop-item'>Delivery</Dropdown.Item>
              <Dropdown.Item eventKey="reservation"  className='drop-item'>Reservation</Dropdown.Item>
            </DropdownButton>
            {orderDetails.type === 'delivery' && (
              <Form.Control type="text" placeholder="Delivery Address" value={orderDetails.deliveryAddress} className="my-2" onChange={e => handleInputChange('deliveryAddress', e.target.value)} required />
            )}
            <Form.Control type="number"  placeholder="Total Price..." value={orderDetails.totalPrice} className="my-2 " onChange={e => handleInputChange('totalPrice', e.target.value)} required />
            <Form.Control type="number" placeholder="The Amount You Need..." value={orderDetails.items[0].quantity} className="my-2" onChange={e => handleItemQuantityChange(0, e.target.value)} required />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn-order' variant='none' onClick={handleClose}>Close</Button>
          <Button className='btn-order' variant='none' onClick={createOrder}>Add</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;