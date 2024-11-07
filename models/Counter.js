const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Identifier for the counter (e.g., 'artwork_id')
    seq: { type: Number, default: 0 }        // Sequence number for generating unique numeric IDs
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
