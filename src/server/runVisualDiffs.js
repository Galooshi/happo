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

module.exports = function runVisualDiffs() {
  return initializeDriver()
    .then(loadTestPage)
    .then(checkForInitializationErrors);
};
