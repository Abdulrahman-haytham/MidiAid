const controller = require('./kafupost.controller.js');
const route = require('./kafupost.route.js');
const validator = require('./kafupost.validator.js');
const KafuPost = require('./KafuPost.model.js');
const service = require('./kafupost.service.js');

module.exports = {
  controller,
  route,
  validator,
  KafuPost,
  service,
};
