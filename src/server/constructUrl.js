const config = require('./config');

module.exports = function constructUrl(path) {
  return `http://${config.bind}:${config.port}${path}`;
};
