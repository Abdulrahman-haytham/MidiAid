const controller = require('./emergencyorder.controller.js');
const EmergencyOrder = require('./EmergencyOrder.model.js');
const service = require('./emergencyorder.service.js');

module.exports = {
  controller,
  EmergencyOrder,
  service,
};
