const config = require('./config');

module.exports = function constructUrl(path) {
  return `http://${config.get().bind}:${config.get().port}${path}`;
};
