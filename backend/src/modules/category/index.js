const controller = require('./category.controller.js');
const route = require('./category.route.js');
const validator = require('./category.validator.js');
const Category = require('./Category.model.js');
const service = require('./category.service.js');

module.exports = {
  controller,
  route,
  validator,
  Category,
  service,
};
