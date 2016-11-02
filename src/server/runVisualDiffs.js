const pngCrop = require('png-crop');
const seleniumWebdriver = require('selenium-webdriver');

const config = require('./config');
const constructUrl = require('./constructUrl');

function initializeDriver() {
  return new Promise((resolve, reject) => {
    try {
      resolve(new seleniumWebdriver.Builder().forBrowser(config.driver).build());
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
    driver.get(constructUrl('/')).then(() => resolve(driver));
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

function renderExamples({ driver, examples }) {
  const script = `
    var doneFunc = arguments[arguments.length - 1];
    window.happo.renderExample(arguments[0], arguments[arguments.length - 1]);
  `;

  return new Promise((resolve, reject) => {
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

          driver.takeScreenshot().then(screenshot => {
            const cropConfig = { width, height, top, left };
            // TODO we might need to guard against overcropping or
            // undercropping here, depending on png-crop's behavior.

            // This is deprecated in Node 6. We will eventually need to change
            // this to:
            //
            //   Buffer.from(screenshot, 'base64')
            const screenshotBuffer = new Buffer(screenshot, 'base64');

            pngCrop.cropToStream(screenshotBuffer, cropConfig, (cropError, outputStream) => {
              if (cropError) {
                throw cropError;
              }

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
              // TODO implement this algorithm

              process.stdout.write('.');
              processNextExample();
            });
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
        renderExamples({ driver, examples })
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
