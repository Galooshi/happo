const childProcess = require('child_process');

module.exports = function initializePackager(options) {
  return new Promise((resolve, reject) => {
    const command = options.packagerCommand;
    const args = options.packageArgs;
    const cwd = options.packagerCwd;
    const env = options.packagerEnv;

    const packagerProcess = childProcess.spawn(command, args, { cwd, env });

    packagerProcess.stderr.on('data', (data) => {
      console.log(`[Packager]: Error ${data}`);
      packagerProcess.kill();
      reject();
    });
    let loaded = false;
    packagerProcess.stdout.on('data', (data) => {
      console.log(`[Packager]: ${data}`);
      if (loaded) return;
      if (data.indexOf('React packager ready.') >= 0) {
        loaded = true;
        console.log('Packager resolved!');
        resolve();
      }
    });
    process.on('error', (e) => {
      console.log('error', e);
      packagerProcess.kill();
      process.exit(1);
    });
    packagerProcess.on('exit', () => {
      // TODO(lmr): this is a race condition...
      // this can happen after resolve and it will still break the process. Not sure what the
      // best way to solve this would be.
      reject();
      process.exit(1);
    });
    process.on('exit', () => {
      console.log('[Packager]: Exiting...');
      packagerProcess.kill();
    });
  });
};
