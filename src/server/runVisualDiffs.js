const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const pngCrop = require('png-crop');
const seleniumWebdriver = require('selenium-webdriver');

const config = require('./config');
const constructUrl = require('./constructUrl');
const pathToSnapshot = require('./pathToSnapshot');

const PNG = require('pngjs').PNG;

function initializeDriver() {
  return new Promise((resolve, reject) => {
    try {
      const driver =
        new seleniumWebdriver.Builder().forBrowser(config.driver).build();
      driver.manage().timeouts().setScriptTimeout(3000);
      resolve(driver);
    } catch (error) {
      reject(error);
    }
  });
}

function checkForInitializationErrors(driver) {
  return new Promise((resolve, reject) => {
    driver.executeScript('return window.happo.errors;').then((errors) => {
      if (errors.length) {
        reject(new Error(
          `JavaScript errors found during initialization:\n${JSON.stringify(errors)}`));
      } else {
        resolve(driver);
      }
    });
  });
}

function loadTestPage(driver) {
  return new Promise((resolve) => {
    driver.get(constructUrl('/snapshot')).then(() => resolve(driver));
  });
}

function resolveViewports(example) {
  const viewports = example.options.viewports ||
    Object.keys(config.viewports).slice(0, 1);

  return viewports.map((viewport) =>
    Object.assign({}, config.viewports[viewport], { name: viewport }));
}

function getExamplesByViewport(driver) {
  return new Promise((resolve, reject) => {
    driver.executeScript('return window.happo.getAllExamples();').then((examples) => {
      if (!examples.length) {
        reject(new Error('No happo examples found'));
      } else {
        const examplesByViewport = {};
        examples.forEach((example) => {
          resolveViewports(example).forEach((viewport) => {
            examplesByViewport[viewport.name] =
              examplesByViewport[viewport.name] || {};

            examplesByViewport[viewport.name].viewport =
              examplesByViewport[viewport.name].viewport || viewport;

            examplesByViewport[viewport.name].examples =
              examplesByViewport[viewport.name].examples || [];

            examplesByViewport[viewport.name].examples.push(example);
          });
        });
        resolve({ driver, examplesByViewport });
      }
    });
  });
}

function getImageFromStream(stream) {
  return new Promise((resolve) => {
    stream.pipe(new PNG()).on('parsed', function parsedCallback() {
      // `this` is bound to an object with the following properties:
      //    width (number)
      //    height (number)
      //    data (array of pixels, similar to what <canvas> uses)
      //    pack (function)
      //  }
      resolve(this);
    });
  });
}

function takeCroppedScreenshot({ driver, width, height, top, left }) {
  return new Promise((resolve, reject) => {
    driver.takeScreenshot().then(screenshot => {
      const cropConfig = { width, height, top, left };
      // TODO we might need to guard against overcropping or
      // undercropping here, depending on png-crop's behavior.

      // This is deprecated in Node 6. We will eventually need to change
      // this to:
      //
      //   Buffer.from(screenshot, 'base64')
      const screenshotBuffer = new Buffer(screenshot, 'base64');

      pngCrop.cropToStream(screenshotBuffer, cropConfig, (error, outputStream) => {
        if (error) {
          reject(error);
          return;
        }
        getImageFromStream(outputStream).then(resolve);
      });
    });
  });
}

function areImagesEqual(a, b) {
  if (a.height !== b.height) {
    return false;
  }
  if (a.width !== b.width) {
    return false;
  }
  const len = a.data.length;
  for (let i = 0; i < len; i++) {
    if (a.data[i] !== b.data[i]) {
      return false;
    }
  }
  return true;
}

function compareAndSave({ description, viewportName, snapshotImage }) {
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
      getImageFromStream(fs.createReadStream(currentImagePath))
        .then((currentImage) => {
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
      snapshotImage.pack().pipe(fs.createWriteStream(currentImagePath))
        .on('finish', () => {
          resolve({
            result: 'new',
            height: snapshotImage.height,
          });
        });
    }
  });
}

function renderExamples({ driver, examples, viewportName }) {
  const script = `
    var doneFunc = arguments[arguments.length - 1];
    window.happo.renderExample(arguments[0], arguments[arguments.length - 1]);
  `;

  return new Promise((resolve) => {
    process.stdout.write('  ');

    function processNextExample() {
      if (!examples.length) {
        console.log(' done!');
        resolve(driver);
        return;
      }

      const { description } = examples.shift();
      driver.executeAsyncScript(script, description)
        .then(({ error, width, height, top, left }) => {
          if (error) {
            const errorMessage = `Error rendering "${description}":\n  ${error}`;
            throw new Error(errorMessage);
          }

          takeCroppedScreenshot({ driver, description, width, height, top, left })
            .then((snapshotImage) =>
              compareAndSave({ description, viewportName, snapshotImage }))
            .then(({ result /* , height: resultingHeight */ }) => {
              // TODO add result to summary object
              process.stdout.write(result === 'diff' ? 'D' : '.');
              processNextExample();
            });
        });
    }

    processNextExample();
  });
}

function performDiffs({ driver, examplesByViewport }) {
  return new Promise((resolve, reject) => {
    const viewportNames = Object.keys(examplesByViewport);
    function processViewportIter() {
      const name = viewportNames.shift();
      if (!name) {
        // we're out of viewports
        resolve();
        return;
      }
      const {
        examples,
        viewport: { width, height },
      } = examplesByViewport[name];

      driver.manage().window().setSize(width, height).then(() => {
        console.log(`${name} (${width}x${height})`);
        renderExamples({ driver, examples, viewportName: name })
          .then(processViewportIter)
          .catch(reject);
      });
    }
    processViewportIter();
  });
}

module.exports = function runVisualDiffs() {
  return initializeDriver()
    .then(loadTestPage)
    .then(checkForInitializationErrors)
    .then(getExamplesByViewport)
    .then(performDiffs);
  // TODO write out result summary file
};
