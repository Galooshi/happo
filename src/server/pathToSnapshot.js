const path = require('path');

const config = require('./config');

module.exports = function pathToSnapshot({ description, viewportName, fileName }) {
  return path.join(
    config.snapshotsFolder,
    new Buffer(description).toString('base64'),
    `@${viewportName}`,
    fileName,
  );
};
