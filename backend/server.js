// Import required libraries
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const connectDB = require('./config/database');

const authRoute = require('./routers/auth.route');
const uploadRoutes = require('./routers/upload.route');
const categoryRoutes = require('./routers/category.route');
const cartRoutes = require('./routers/cart.route');
const kafuPostRoutes = require('./routers/kafuPosts.route');
const orderRoutes = require('./routers/order.route');
const pharmacyRoutes = require('./routers/pharmacy.route');
const productRoutes = require('./routers/product.route');
const usedMedicineRoutes = require('./routers/usedMedicine.route');

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoute);
app.use('/api/uploads', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/kafu-posts', kafuPostRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/used-medicines', usedMedicineRoutes);

app.get('/', (req, res) => {
    res.status(200).send('🚀 Server is running successfully!');
});

// Middleware to handle invalid API endpoints
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Invalid API endpoint' });
});

connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});
