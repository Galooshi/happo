/* eslint import/no-dynamic-require: 1 */
const fs = require('fs');
const path = require('path');

const { HAPPO_CONFIG_FILE } = process.env;

const defaultConfig = {
  bind: 'localhost',
  driver: 'firefox',
  port: 4567,
  snapshotsFolder: 'snapshots',
  resultSummaryFilename: 'resultSummary.json',
  publicDirectories: [],
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
  const file = path.join(process.cwd(), HAPPO_CONFIG_FILE || '.happo.js');
  if (!fs.existsSync(file)) {
    return {};
  }
  return require(file); // eslint-disable-line global-require
}

module.exports = Object.assign(defaultConfig, readUserConfig());
