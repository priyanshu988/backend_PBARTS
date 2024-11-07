// models/Newsletter.js

const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,  // Ensures each email is unique
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']  // Basic email format validation
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
