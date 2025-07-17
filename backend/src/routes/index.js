
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
  app.use(`${apiPrefix}/auth`, userRoutes);
  app.use(`${apiPrefix}/uploads`, uploadRoutes);
  app.use(`${apiPrefix}/categories`, categoryRoutes); 
  app.use(`${apiPrefix}/cart`, cartRoutes);
  app.use(`${apiPrefix}/kafu-posts`, kafuPostRoutes);
  app.use(`${apiPrefix}/orders`, orderRoutes);
  app.use(`${apiPrefix}/pharmacies`, pharmacyRoutes);
  app.use(`${apiPrefix}/products`, productRoutes);
  app.use(`${apiPrefix}/used-medicines`, usedMedicineRoutes);
  app.use(`${apiPrefix}/emergency-order`, emergencyOrderRoutes);

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
  });

  app.use('*', (req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
  });
};

module.exports = configureRoutes;