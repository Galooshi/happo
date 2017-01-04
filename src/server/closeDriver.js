const psNode = require('ps-node');

function kill(pid) {
  return new Promise((resolve, reject) => {
    psNode.kill(pid, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Works around an issue in marionette causing ghost firefox instances to remain
// running.
//
// https://bugzilla.mozilla.org/show_bug.cgi?id=1310992
// https://github.com/mozilla/geckodriver/issues/285
module.exports = function closeDriver(driver) {
  return new Promise((resolve, reject) => {
    driver.close();
    psNode.lookup({
      command: 'firefox',
      arguments: '--marionette',
    }, (err, externalProcesses) => {
      if (err) {
        reject(err);
        return;
      }
      Promise.all(externalProcesses.map(({ pid }) => kill(pid)))
        .then(resolve)
        .catch(reject);
    });
  });
};
