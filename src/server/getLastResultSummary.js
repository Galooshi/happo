const fs = require('fs');
const path = require('path');

const { config } = require('./config');

module.exports = function getLastResultSummary() {
  const resultSummaryJSON = fs.readFileSync(
    path.join(config.snapshotsFolder, config.resultSummaryFilename),
    'utf8',
  );
  return JSON.parse(resultSummaryJSON);
};
