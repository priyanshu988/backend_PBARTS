// Assuming Express.js setup
const Razorpay = require("razorpay");
const express = require("express");
const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order endpoint
router.post("/api/payment/order", async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: "order_rcptid_11",
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).send("Something went wrong with the payment.");
    }
});

module.exports = router;
