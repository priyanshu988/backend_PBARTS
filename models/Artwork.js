// models/artworkModel.js
const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true, 
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: true,
    },
    width: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountedPrice: {
        type: Number,
        required: true,
    },
    medium: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
});

// Create a model based on the schema
const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = Artwork;
