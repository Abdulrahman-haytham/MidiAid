import React, { useState } from 'react';
import {
  useGetFromCartQuery,
  useRemoveFromCartMutation,
  useUpdateQuanCartMutation,
} from '../../redux/feature/api/categories/categoriesApi';
import { Container, Table } from 'react-bootstrap';
import { CiCircleMinus, CiCirclePlus } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import './Cart.css';
import defaultImg from '../../assets/pro12.png';

const Cart = () => {
  const { data:cartItems=[], isLoading } = useGetFromCartQuery();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateQuanCart] = useUpdateQuanCartMutation();
  const [quantities, setQuantities] = useState({});
  // cartItems && console.log(cartItems.length);
  // const cartItems = [
  //   {
  //     _id:'jaiodjakdiojdjaikl',
  //     image:defaultImg,
  //     quantity:9,
  //     name:'di'
  //   },
  //   {
  //     _id:'jaiodjakdiojdjaikl',
  //     image:defaultImg,
  //     quantity:9,
  //     name:'di'
  //   },
  //   {
  //     _id:'jaiodjakdiojdjaikl',
  //     image:defaultImg,
  //     quantity:9,
  //     name:'di'
  //   }
  // ]
  const handleIncrease = async (itemId) => {
    const newQuantity = (quantities[itemId] || 1) + 1;
    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    await updateQuanCart({ id: itemId, quantity: newQuantity });
  };
 
  const handleDecrease = async (itemId) => {
    const current = quantities[itemId] || 1;
    if (current > 1) {
      const newQuantity = current - 1;
      setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
      await updateQuanCart({ id: itemId, quantity: newQuantity });
    }
  };

  const handleDelete = async (itemId) => {
    await removeFromCart(itemId);
  };

  if (isLoading) return <p className="text-center mt-5">Loading cart...</p>;

  return (
    <Container>
      <div className="pt-3" style={{ minHeight: '100vh' }}>
        <h2 className="cart-text mb-4">My Shopping Cart</h2>

        <Table hover variant="light" className="table-cart fs-5 text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine Name</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <tr key={item._id || index}>
                  <td className="cart-content">
                    <img src={item.image || defaultImg} className="img-cart" alt="product" />
                  </td>
                  <td className="cart-content">{item.name || 'Unnamed'}</td>
                  <td className="cart-content">
                    <div className="d-flex justify-content-center align-items-center gap-3 fs-4">
                      <span className="handle-num" onClick={() => handleIncrease(item.id)}>
                        <CiCirclePlus />
                      </span>
                      {quantities[item._id] || item.quantity || 1}
                      <span className="handle-num" onClick={() => handleDecrease(item.id)}>
                        <CiCircleMinus />
                      </span>
                    </div>
                  </td>
                  <td className="cart-content text-danger fs-3" onClick={() => handleDelete(item.id)}>
                    <MdDelete />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  Your cart is empty.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default Cart;
