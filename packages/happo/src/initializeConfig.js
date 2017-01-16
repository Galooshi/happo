/* eslint import/no-dynamic-require: 1 */
const fs = require('fs');
const path = require('path');

const defaultConfig = {
  bind: 'localhost',
  port: 4567,
  snapshotsFolder: 'snapshots',
  resultSummaryFilename: 'resultSummary.json',
  uploader: null,
  targets: [],
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

function initializeConfig(configFilePath) {
  return Object.assign(defaultConfig,
    readUserConfig(configFilePath || DEFAULT_CONFIG_FILE_LOCATION));
}
module.exports = initializeConfig;
