// routes/newsletterRoutes.js

const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// POST route to subscribe to the newsletter
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Check if the email already exists
        const existingSubscription = await Newsletter.findOne({ email });
        if (existingSubscription) {
            return res.status(400).json({ message: 'This email is already subscribed' });
        }

        // Create a new subscription
        const newSubscription = new Newsletter({ email });
        await newSubscription.save();

        res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while subscribing. Please try again later.' });
    }
});

// DELETE route to unsubscribe from the newsletter
router.delete('/unsubscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const result = await Newsletter.findOneAndDelete({ email });
        
        if (!result) {
            return res.status(404).json({ message: 'This email is not subscribed' });
        }

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while unsubscribing. Please try again later.' });
    }
});

module.exports = router;
