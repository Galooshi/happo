/* eslint import/no-dynamic-require: 1 */
const fs = require('fs');
const path = require('path');

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

const DEFAULT_CONFIG_FILE_LOCATION = '.happo.js';

function readUserConfig(configFilePath) {
  const file = path.resolve(process.cwd(), configFilePath);
  if (!fs.existsSync(file)) {
    if (configFilePath !== DEFAULT_CONFIG_FILE_LOCATION) {
      throw new Error(`Config file does not exist: ${configFilePath}`);
    }
    return {};
  }
  return require(file); // eslint-disable-line global-require
}

function initialize(configFilePath) {
  return Object.assign(defaultConfig,
    readUserConfig(configFilePath || DEFAULT_CONFIG_FILE_LOCATION));
}

const config = initialize(process.env.HAPPO_CONFIG_FILE);

module.exports = {
  config,
  initialize,
};
