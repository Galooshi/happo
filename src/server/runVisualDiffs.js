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

function testConnection(driver) {
  return new Promise((resolve, reject) => {
    const happoDefined = driver.executeScript('return window.happo;');
    if (!happoDefined) {
      reject('`window.happo` is not defined');
    } else {
      resolve(driver);
    }
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
    .then(testConnection);
};
