const controller = require('./pharmacy.controller.js');
const route = require('./pharmacy.route.js');
const validator = require('./pharmacy.validator.js');
const Pharmacy = require('./Pharmacy.model.js');
const service = require('./pharmacy.service.js');

module.exports = {
  controller,
  route,
  validator,
  Pharmacy,
  service,
};
