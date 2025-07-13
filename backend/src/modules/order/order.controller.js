// src/modules/order/order.controller.js

const orderService = require('./order.service');

exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrderFromCart(req.user.id, req.body);
    res.status(201).json({
      message: 'Order created successfully.',
      order: { 
          _id: order._id,
          userId: order.userId,
          pharmacyId: order.pharmacyId,
          items: order.items, 
          orderType: order.orderType,
          deliveryAddress: order.deliveryAddress,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt,
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
          error: 'Validation failed when creating order.', 
          details: error.message,
          errors: error.errors
      });
    }
    const statusCode = error.message.includes('not found') ? 404 : 400;
    if (statusCode === 500) {
      res.status(500).json({ error: 'Failed to create order.', details: error.message });
    } else {
      res.status(statusCode).json({ error: error.message });
    }
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.orderId, status, req.user);
    res.status(200).json({ message: `Order updated to ${status}`, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    const statusCode = error.message.includes('not found') ? 404 : error.message.includes('Unauthorized') ? 403 : 400;
    if (statusCode === 500) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};

exports.getPharmacyOrders = async (req, res) => {
  try {
    const orders = await orderService.findOrdersForPharmacy(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const simplifiedOrders = await orderService.findOrdersForUser(req.user.id);
    res.status(200).json(simplifiedOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await orderService.findOrderDetails(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rateOrder = async (req, res) => {
  try {
    const order = await orderService.rateExistingOrder(req.params.orderId, req.user.id, req.body);
    res.status(200).json({
      message: 'Order rated successfully',
      rating: order.rating,
      pharmacy: order.pharmacyId?.name || 'Unknown Pharmacy',
    });
  } catch (error) {
    console.error('Error rating order:', error);
    const statusCode = error.message.includes('not found') ? 404 : error.message.includes('Unauthorized') ? 403 : 400;
    if (statusCode === 500) {
        res.status(500).json({ error: 'Server error while rating order', details: error.message });
    } else {
        res.status(statusCode).json({ error: error.message });
    }
  }
};