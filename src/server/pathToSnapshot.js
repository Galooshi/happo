const path = require('path');

const config = require('./config');

module.exports = function pathToSnapshot({ description, viewportName, fileName }) {
  return path.join(
    process.cwd(),
    config.snapshotsFolder,
    new Buffer(description).toString('base64'),
    `@${viewportName}`,
    fileName
  );
};
