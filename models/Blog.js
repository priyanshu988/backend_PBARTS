
const mongoose = require('mongoose');

const blogEntrySchema = new mongoose.Schema({
    wallpaper: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    readMoreUrl: {
        type: String,
        required: true
    },
});

const Blog = mongoose.model('Blog', blogEntrySchema);

module.exports = Blog;