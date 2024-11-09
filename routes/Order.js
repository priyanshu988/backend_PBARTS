// routes/orders.js
const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, totalAmount, address, paymentMethod } = req.body;

    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      address,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get all orders for a user
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
});

// Get a specific order by ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
});

module.exports = router;
