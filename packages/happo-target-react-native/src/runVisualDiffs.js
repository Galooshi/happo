const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const {
  RunResult,
  saveResultToFile,
  areImagesEqual,
  getImageFromPath,
  getImageFromDataURI,
  pathToSnapshot,
} = require('happo-core');

function compareAndSave({ description, viewportName, uri }) {
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
        getImageFromDataURI(uri),
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
      getImageFromDataURI(uri).then((snapshotImage) => {
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

function viewportNameFromOptions({
  platformName,
  platformVersion,
  deviceName,
  deviceOrientation,
}) {
  // will return something like 'iPhone 6 (iOS 9.3)'
  // TODO: This could be more descriptive for android but not sure where to get it.
  const suffix = deviceOrientation === 'portrait' ? '' : ` (${deviceOrientation})`;
  return `${deviceName} (${platformName} ${platformVersion})${suffix}`;
}

function snapshotToResultPromise({ description, uri }, viewportName) {
  return compareAndSave({
    description,
    viewportName,
    uri,
  }).then(({ result, height }) => {
    const runResult = new RunResult();
    runResult.add({
      result,
      height,
      description,
      viewportName,
    });
    return runResult;
  });
}

function combineResults(results) {
  return results.reduce((a, b) => {
    a.merge(b);
    return a;
  });
}

module.exports = function runVisualDiffs(snapshots, options) {
  const viewportName = viewportNameFromOptions(options);
  return Promise.all(snapshots.map(s => snapshotToResultPromise(s, viewportName)))
    .then(combineResults)
    .then(saveResultToFile);
};
