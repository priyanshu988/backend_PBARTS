require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Artwork = require('./models/Artwork');
const Blog = require('./models/Blog');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Counter = require('./models/Counter');
const Testimonial = require('./models/Testimonial')
const couponRoutes = require('./routes/Coupon');
const newsletterRoutes = require('./routes/newsletterRoutes');


const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);

// Routes
app.get('/api/artworks', async (req, res) => {
    try {
        const artworks = await Artwork.find();
        res.json(artworks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/blog', async (req, res) => {
    try {
        const blogEntries = await Blog.find();
        res.status(200).json(blogEntries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/testimonial', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: 'Server error: Unable to fetch testimonials' });
    }
});


// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dy4qtchbm',
    api_key: '589718974158513',
    api_secret: 'rLAytn4IFAb4ukDEQEJsQL9x36k', // Replace with your API secret
});

// Multer setup for handling file uploads
const storage = multer.memoryStorage(); // Storing file in memory
const upload = multer({ storage });

const getNextArtworkId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: 'id' },
        { $inc: { seq: 1 } },   // Increment the counter
        { new: true, upsert: true } // Create counter if it doesn't exist
    );
    return counter.seq; // Return the updated sequence number
};

// POST route to handle artwork upload
app.post('/api/artworks', upload.single('image'), async (req, res) => {
    const { title, category, length, width, originalPrice, discountedPrice, medium } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }

    try {
        // Upload image to Cloudinary using a stream
        const artworkId = await getNextArtworkId();
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'artworks',  // Store images in 'artworks' folder in Cloudinary
                        public_id: `${Date.now()}-${req.file.originalname}`, // Unique public ID
                        format: 'jpg',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            console.log("cloudinary done")
                            resolve(result.secure_url); // Return the secure URL
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream); // Stream the file buffer
            });
        };

        const imageUrl = await uploadToCloudinary(); // Wait for the upload to complete

        // Create new artwork object
        const artwork = new Artwork({
            id: artworkId,
            title,
            category,
            length,
            width,
            price: originalPrice,
            discountedPrice,
            medium,
            image: imageUrl, // Cloudinary secure URL
        });

        // Save artwork to MongoDB
        const savedArtwork = await artwork.save();
        console.log("mongo done")
        res.status(201).json(savedArtwork); // Return the saved artwork
    } catch (error) {
        console.error('Error uploading artwork:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/blog', async (req, res) => {
    const { wallpaper, title, shortDescription, readMoreUrl } = req.body;
    try {
        const newBlogEntry = new Blog({ wallpaper, title, shortDescription, readMoreUrl });
        await newBlogEntry.save();
        res.status(201).json(newBlogEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/testimonial', async (req, res) => {
    const { name, feedback } = req.body;

    if (!name || !feedback) {
        return res.status(400).json({ error: 'Name and feedback are required' });
    }

    try {
        const newTestimonial = new Testimonial({
            name,
            feedback
        });

        const savedTestimonial = await newTestimonial.save();
        res.json(savedTestimonial);
    } catch (error) {
        res.status(500).json({ error: 'Server error: Unable to save testimonial' });
    }
});

app.use('/api/newsletter', newsletterRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
