const { constructUrl } = require('happo-core');
const runVisualDiffs = require('./runVisualDiffs');
const initializeWebdriver = require('./initializeWebdriver');
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
        .then(result => driver.close())
        .catch(error => {
          driver.close();
          throw new Error(error);
        }));
  }
}

module.exports = FirefoxTarget;
