const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],  // Percentage or fixed amount discount
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    maxDiscount: {
        type: Number,  // Optional: Max discount cap (only applicable for percentage discounts)
    },
    minPurchase: {
        type: Number,  // Optional: Minimum purchase value to apply the coupon
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,  // Optional: Limit number of times the coupon can be used
        default: 1,
    },
    usedCount: {
        type: Number,
        default: 0,  // Track how many times the coupon has been used
    },
    isActive: {
        type: Boolean,
        default: true,  // Coupon should be active to be used
    },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
