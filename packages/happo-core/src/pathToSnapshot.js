const path = require('path');

const config = require('./config');

function pathToSnapshot({ description, viewportName, fileName }) {
  return path.join(
    config.get().snapshotsFolder,
    new Buffer(description).toString('base64'),
    `@${viewportName}`,
    fileName,
  );
}

module.exports = pathToSnapshot;
