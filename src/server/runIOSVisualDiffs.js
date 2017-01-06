const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');

const { config } = require('./config');
const pathToSnapshot = require('./pathToSnapshot');
const initializeIOSdriver = require('./initializeIOSdriver');
const setupWebsockets = require('./setupWebsockets');
const RunResult = require('./RunResult');
const getImageFromStream = require('./getImageFromStream');
const saveResultToFile = require('./saveResultToFile');
const areImagesEqual = require('./areImagesEqual');

function getImageFromPath(fpath) {
  return getImageFromStream(fs.createReadStream(fpath));
}

function compareAndSave({ description, viewportName, tmpFile }) {
  return new Promise((resolve) => {
    const previousImagePath = pathToSnapshot({
      description,
      viewportName,
      fileName: 'previous.png',
    });

    const currentImagePath = pathToSnapshot({
      description,
      viewportName,
      fileName: 'current.png',
    });

    // This is potentially expensive code that is run in a tight loop
    // for every snapshot that we will be taking. With that in mind,
    // we want to do as little work here as possible to keep runs
    // fast. Therefore, we have landed on the following algorithm:
    //
    // 1. Delete previous.png if it exists.
    // 2. Compare the current snapshot in memory against current.png
    //    if it exists.
    // 3. If there is a diff, move current.png to previous.png
    // 4. If there is no diff, return, leaving the old current.png in
    //    place.
    if (fs.existsSync(previousImagePath)) {
      fs.unlinkSync(previousImagePath);
    }

    if (fs.existsSync(currentImagePath)) {
      Promise.all([
        getImageFromPath(currentImagePath),
        getImageFromPath(tmpFile),
      ])
        .then(([currentImage, snapshotImage]) => {
          if (areImagesEqual(currentImage, snapshotImage)) {
            resolve({
              result: 'equal',
            });
          } else {
            fs.renameSync(currentImagePath, previousImagePath);

            snapshotImage.pack().pipe(fs.createWriteStream(currentImagePath))
              .on('finish', () => {
                resolve({
                  result: 'diff',
                  height: Math.max(snapshotImage.height, currentImage.height),
                });
              });
          }
        });
    } else {
      mkdirp.sync(path.dirname(currentImagePath));
      getImageFromPath(tmpFile).then((snapshotImage) => {
        snapshotImage.pack().pipe(fs.createWriteStream(currentImagePath))
          .on('finish', () => {
            resolve({
              result: 'new',
              height: snapshotImage.height,
            });
          });
      });
    }
  });
}

module.exports = function runIOSVisualDiffs() {
  const viewportName = 'ios';
  return new Promise((resolve) => {
    setupWebsockets(
      (/* name, uri */) => {
        // do nothing
      },
      (snapshots) => {
        resolve(snapshots);
      }
    ).then(initializeIOSdriver);
  })
    .then(snapshots => Promise.all(snapshots.map(({ description, tmpFile }) => compareAndSave({
      description,
      viewportName,
      tmpFile,
    }).then(({ result, height }) => ({ result, height, description, viewportName })))))
    .then((results) => {
      const result = new RunResult();
      results.forEach(x => result.add(x));
      return result;
    })
    .then(saveResultToFile);
};
