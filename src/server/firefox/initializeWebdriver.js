require('./addGeckoDriverToPath');

const seleniumWebdriver = require('selenium-webdriver');

const { config } = require('../config');

module.exports = function initializeWebdriver() {
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
};
