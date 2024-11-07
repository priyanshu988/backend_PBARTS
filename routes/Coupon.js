const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Create a new coupon
router.post('/create', async (req, res) => {
    const { code, discountType, discountValue, maxDiscount, minPurchase, expirationDate, usageLimit } = req.body;

    try {
        // Check if the coupon code already exists
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const newCoupon = new Coupon({
            code,
            discountType,
            discountValue,
            maxDiscount,
            minPurchase,
            expirationDate,
            usageLimit
        });

        await newCoupon.save();
        res.status(201).json(newCoupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all coupons
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Validate a coupon (Check if it's valid)
router.post('/validate', async (req, res) => {
    const { code, totalAmount } = req.body;

    try {
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon' });
        }

        // Check if the coupon has expired
        if (new Date() > coupon.expirationDate) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        // Check if the minimum purchase requirement is met
        if (coupon.minPurchase && totalAmount < coupon.minPurchase) {
            return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minPurchase} is required` });
        }

        // Check if the coupon has reached its usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        // Calculate discount based on type
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (coupon.discountValue / 100) * totalAmount;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount; // Cap the discount to the max discount value
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        const finalAmount = totalAmount - discountAmount;

        res.status(200).json({
            discountAmount,
            finalAmount,
            message: `Coupon applied successfully!`
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark a coupon as used (increment usage count)
router.post('/use', async (req, res) => {
    const { code } = req.body;

    try {
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon' });
        }

        // Increment the used count
        coupon.usedCount += 1;

        // Check if usage limit has been reached after the increment
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            coupon.isActive = false; // Deactivate the coupon if the limit is reached
        }

        await coupon.save();
        res.status(200).json({ message: 'Coupon marked as used' });
    } catch (error) {
        console.error('Error marking coupon as used:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
