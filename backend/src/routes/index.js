
const cartRoutes = require('../modules/cart/cart.route');
const categoryRoutes = require('../modules/category/category.route');
const emergencyOrderRoutes = require('../modules/emergencyOrder/emergencyorder.route');
const kafuPostRoutes = require('../modules/kafuPost/kafupost.route');
const orderRoutes = require('../modules/order/order.route');
const pharmacyRoutes = require('../modules/pharmacy/pharmacy.route');
const productRoutes = require('../modules/product/product.route');
const uploadRoutes = require('../modules/upload/upload.route');
const usedMedicineRoutes = require('../modules/usedMedicine/usedmedicine.route');
const userRoutes = require('../modules/user/user.route');


const configureRoutes = (app) => {
  const apiPrefix = '/api';

  app.use(`${apiPrefix}/cart`, cartRoutes);
  app.use(`${apiPrefix}/category`, categoryRoutes);
  app.use(`${apiPrefix}/emergency-order`, emergencyOrderRoutes);
  app.use(`${apiPrefix}/kafu-post`, kafuPostRoutes);
  app.use(`${apiPrefix}/order`, orderRoutes);
  app.use(`${apiPrefix}/pharmacy`, pharmacyRoutes);
  app.use(`${apiPrefix}/product`, productRoutes);
  app.use(`${apiPrefix}/upload`, uploadRoutes);
  app.use(`${apiPrefix}/used-medicine`, usedMedicineRoutes);
  app.use(`${apiPrefix}/auth`, userRoutes);
  
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
  });

  app.use('*', (req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
  });
};

module.exports = configureRoutes;