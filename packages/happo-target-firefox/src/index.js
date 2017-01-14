const { constructUrl } = require('happo-core');
const runVisualDiffs = require('./runVisualDiffs');
const initializeWebdriver = require('./initializeWebdriver');
const closeDriver = require('./closeDriver');
const checkBrowserVersion = require('./checkBrowserVersion');
const server = require('./server');
const defaultOptions = require('./defaultOptions');

class FirefoxTarget {
  constructor(passedOptions) {
    this.options = {
      ...defaultOptions,
      ...passedOptions,
    };
    this.name = this.options.name;
  }

  debug() {
    return server.start(this.options).then(() => {
      console.log(`=> ${constructUrl('/debug')}`);
    });
  }

  run() {
    return server.start(this.options)
      .then(checkBrowserVersion)
      .then(() => initializeWebdriver(this.options))
      .then(driver => runVisualDiffs(driver, this.options)
        .then(result => closeDriver(driver).then(() => result))
        .catch(error => closeDriver(driver).then(() => {
          throw error;
        })));
  }
}

module.exports = FirefoxTarget;
