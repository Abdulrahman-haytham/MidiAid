// src/core/middlewares/index.js

module.exports = {
  hasRole: require('./hasRole'),
  isAuthenticated: require('./isAuthenticated'),
  isOwner: require('./isOwner'),
  validate: require('./validate'),
 
  middlewaresService: require('./middlewares.service') 
};