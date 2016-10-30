const fs = require('fs');
const path = require('path');

const defaultConfig = {
  port: 4567,
  sourceFiles: [],
  stylesheets: [],
  driver: 'firefox',
};

function readUserConfig() {
  const file = path.join(process.cwd(), '.happo.js');
  if (!fs.existsSync(file)) {
    return {};
  }
  return require(file); // eslint-disable-line global-require
}

module.exports = Object.assign(defaultConfig, readUserConfig());
