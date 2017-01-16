require('./addGeckoDriverToPath');

const seleniumWebdriver = require('selenium-webdriver');

module.exports = function initializeWebdriver(options) {
  return new Promise((resolve, reject) => {
    try {
      const driver =
        new seleniumWebdriver.Builder().forBrowser('firefox').build();
      driver.manage().timeouts().setScriptTimeout(options.scriptTimeout);
      resolve(driver);
    } catch (error) {
      reject(error);
    }
  });
};
