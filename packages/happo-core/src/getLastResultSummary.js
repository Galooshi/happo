const fs = require('fs');
const path = require('path');

const config = require('./config');

function getLastResultSummary() {
  const resultSummaryJSON = fs.readFileSync(
    path.join(config.get().snapshotsFolder, config.get().resultSummaryFilename),
    'utf8',
  );
  return JSON.parse(resultSummaryJSON);
}

module.exports = getLastResultSummary;
