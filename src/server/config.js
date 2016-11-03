const fs = require('fs');
const path = require('path');

const defaultConfig = {
  driver: 'firefox',
  port: 4567,
  snapshotsFolder: './snapshots',
  sourceFiles: [],
  stylesheets: [],
  viewports: {
    large: {
      width: 1024,
      height: 768,
    },
    medium: {
      width: 640,
      height: 888,
    },
    small: {
      width: 320,
      height: 444,
    },
  },
};

function readUserConfig() {
  const file = path.join(process.cwd(), '.happo.js');
  if (!fs.existsSync(file)) {
    return {};
  }
  return require(file); // eslint-disable-line global-require
}

module.exports = Object.assign(defaultConfig, readUserConfig());
