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

function performDiffs({ driver, examplesByViewport }) {
  return new Promise((resolve) => {
    const viewportNames = Object.keys(examplesByViewport);
    function processViewportIter() {
      const name = viewportNames.shift();
      if (!name) {
        // we're out of viewports
        resolve();
        return;
      }
      const {
        viewport: { width, height },
      } = examplesByViewport[name];

      driver.manage().window().setSize(width, height).then(() => {
        // TODO: render the examples
        processViewportIter();
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
};
