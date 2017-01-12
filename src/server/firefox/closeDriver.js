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

function logError(err) {
  console.warn(
    'Saw error when making sure that firefox is closed properly. ' +
    'This is most likely safe to ignore, but you might want to ' +
    'manually check that no orphaned firefox processes are running.',
  err);
}

// Works around an issue in marionette causing ghost firefox instances to remain
// running.
//
// https://bugzilla.mozilla.org/show_bug.cgi?id=1310992
// https://github.com/mozilla/geckodriver/issues/285
module.exports = function closeDriver(driver) {
  return new Promise((resolve) => {
    driver.close();
    psNode.lookup({
      command: 'firefox',
      arguments: '--marionette',
    }, (err, externalProcesses) => {
      if (err) {
        logError(err);
        resolve();
        return;
      }
      Promise.all(externalProcesses.map(({ pid }) => kill(pid)))
        .then(resolve)
        .catch((error) => {
          logError(error);
          resolve();
        });
    });
  });
};
