const checkBrowserVersion = require('./checkBrowserVersion');
const closeDriver = require('./closeDriver');
const initializeWebdriver = require('./initializeWebdriver');
const runVisualDiffs = require('./runVisualDiffs');

module.exports = {
  run() {
    return new Promise((resolve, reject) => {
      checkBrowserVersion()
        .then(initializeWebdriver)
        .then((driver) => {
          runVisualDiffs(driver)
            .then(() => {
              closeDriver(driver);
              resolve();
            })
            .catch((error) => {
              closeDriver(driver);
              reject(error);
            });
        });
    });
  },
};
