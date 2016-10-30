const config = require('./config');

module.exports = function constructUrl(path) {
  return `http://localhost:${config.port}${path}`;
};
