const fs = require('fs');
const path = require('path');
const config = require('./config');

function saveResultsToFile(runResult) {
  return new Promise((resolve, reject) => {
    const resultToSerialize = Object.assign({
      generatedAt: Date.now(),
    }, runResult);

    const pathToFile = path.join(
      config.get().snapshotsFolder, config.get().resultSummaryFilename);

    fs.writeFile(pathToFile, JSON.stringify(resultToSerialize), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(resultToSerialize);
      }
    });
  });
}

module.exports = saveResultsToFile;
