const childProcess = require('child_process');

const firefox = require('selenium-webdriver/firefox');

const { config } = require('../config');

const MINIMUM_FIREFOX_VERSION = 50.0;
const FIREFOX_VERSION_MATCHER = /Mozilla Firefox ([0-9.]+)/;

module.exports = function checkBrowserVersion() {
  if (config.driver !== 'firefox') {
    // Our main browser target is Firefox. If you are using something else, you
    // must know what you are doing. :)
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    new firefox.Binary().locate().then((pathToExecutable) => {
      childProcess.exec(`${pathToExecutable} --version`, (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to check Firefox version: ${error}`));
          return;
        }
        const match = stdout.match(FIREFOX_VERSION_MATCHER);
        if (!match) {
          reject(new Error(`Failed to parse Firefox version string "${stdout}"`));
        } else if (parseFloat(match[1]) < MINIMUM_FIREFOX_VERSION) {
          reject(new Error(
            `Happo requires Firefox version ${MINIMUM_FIREFOX_VERSION} or later. ` +
            `You are using ${stdout}`));
        } else {
          resolve();
        }
      });
    });
  });
};
