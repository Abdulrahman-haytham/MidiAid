const controller = require('./user.controller.js');
const route = require('./user.route.js');
const validator = require('./user.validator.js');
const User = require('./User.model.js');
const service = require('./user.service.js');

module.exports = {
  controller,
  route,
  validator,
  User,
  service,
};
