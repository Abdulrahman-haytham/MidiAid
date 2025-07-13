const controller = require('./order.controller.js');
const route = require('./order.route.js');
const validator = require('./order.validator.js');
const Order = require('./Order.model.js');
const service = require('./order.service.js');

module.exports = {
  controller,
  route,
  validator,
  Order,
  service,
};
