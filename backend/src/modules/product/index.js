const controller = require('./product.controller.js');
const route = require('./product.route.js');
const validator = require('./product.validator.js');
const Product = require('./Product.model.js');
const service = require('./product.service.js');

module.exports = {
  controller,
  route,
  validator,
  Product,
  service,
};
