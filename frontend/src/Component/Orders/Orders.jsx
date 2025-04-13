import React, { useEffect, useState, useCallback } from 'react';
import { Button, Form, Modal, Table, Alert, Dropdown, DropdownButton, Toast, ToastContainer } from 'react-bootstrap';
import './Orders.css';
import { useAddOrderMutation, useGetOrdersQuery } from '../../redux/feature/api/categories/categoriesApi';

const Orders = () => {
  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    pharmacyName: '',
    orderType: '',
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
    setOrderDetails({ pharmacyName: '', orderType: '', deliveryAddress: '' });
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const createOrder = async () => {
    if (
      !orderDetails.pharmacyName ||
      !orderDetails.orderType ||
      (orderDetails.orderType === 'delivery' && !orderDetails.deliveryAddress)
    ) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      await addOrder(orderDetails).unwrap();
      handleClose();
      setShowToast(true);
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
              <td>{order.pharmacyName}</td>
              <td>{order.orderType}</td>
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
            <Form.Control
              type="text"
              placeholder="Pharmacy..."
              value={orderDetails.pharmacyName}
              className="my-2"
              onChange={e => handleInputChange('pharmacyName', e.target.value)}
              required
            />

            <DropdownButton
              title={orderDetails.orderType || "Select Type"}
              onSelect={type => handleInputChange('orderType', type)}
              variant='none'
              className="my-2 btn-order p-0 bg-light"
            >
              <Dropdown.Item eventKey="delivery" className='drop-item'>Delivery</Dropdown.Item>
              <Dropdown.Item eventKey="reservation" className='drop-item'>Reservation</Dropdown.Item>
            </DropdownButton>

            {orderDetails.orderType === 'delivery' && (
              <Form.Control
                type="text"
                placeholder="Delivery Address"
                value={orderDetails.deliveryAddress}
                className="my-2"
                onChange={e => handleInputChange('deliveryAddress', e.target.value)}
                required
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn-order' variant='none' onClick={handleClose}>Close</Button>
          <Button className='btn-order' variant='none' onClick={createOrder}>Add</Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Toast for success message */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="success"
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Order Added</strong>
          </Toast.Header>
          <Toast.Body className="text-white">The order was added successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Orders;
