// Import required libraries
const express = require('express'); // Express.js framework
const cors = require('cors'); // Middleware to handle CORS (Cross-Origin Resource Sharing)
const path = require('path'); // Utility to handle file and directory paths
const morgan = require('morgan'); // HTTP request logger middleware
require('dotenv').config(); // Load environment variables from .env file

// Create an Express application
const app = express();

// Import the database connection function
const connectDB = require('./config/database');

// Import routers
const authRoute = require('./routers/auth.route'); // Authentication router
const uploadRoutes = require('./routers/upload.route'); // File upload router
const categoryRoutes = require('./routers/category.route'); // Category router
const cartRoutes = require('./routers/cart.route'); // Shopping cart router
const kafuPostRoutes = require('./routers/kafuPosts.route'); // Kafu posts router
const orderRoutes = require('./routers/order.route'); // Order router
const pharmacyRoutes = require('./routers/pharmacy.route'); // Pharmacy router
const productRoutes = require('./routers/product.route'); // Product router
const usedMedicineRoutes = require('./routers/usedMedicine.route'); // Used medicine router

// Middleware to parse JSON requests
app.use(express.json());

// Use morgan middleware for logging HTTP requests
app.use(morgan('dev')); // Logs requests in the 'dev' format

// Middleware to handle CORS
app.use(cors());

// Middleware to serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware to serve static files from the 'uploads' folder
app.use('/uploads', express.static('uploads'));

// Use routers with appropriate API paths
app.use('/api/auth', authRoute); // Authentication routes
app.use('/api/uploads', uploadRoutes); // File upload routes
app.use('/api/categories', categoryRoutes); // Category routes
app.use('/api/cart', cartRoutes); // Shopping cart routes
app.use('/api/kafu-posts', kafuPostRoutes); // Kafu posts routes
app.use('/api/orders', orderRoutes); // Order routes
app.use('/api/pharmacies', pharmacyRoutes); // Pharmacy routes
app.use('/api/products', productRoutes); // Product routes
app.use('/api/used-medicines', usedMedicineRoutes); // Used medicine routes

// Middleware to handle invalid API endpoints
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Invalid API endpoint' });
});

// Connect to the database
connectDB();

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});