const childProcess = require('child_process');

module.exports = function buildBundle(options) {
  return new Promise((resolve, reject) => {
    const command = options.bundlerCommand;
    const args = options.bundlerArgs;
    const cwd = options.packagerCwd;
    const env = options.packagerEnv;

    const packagerProcess = childProcess.spawn(command, args, { cwd, env });

    packagerProcess.stderr.on('data', (data) => {
      console.log(`[Bundler]: Error ${data}`);
      packagerProcess.kill();
      reject(new Error(data));
    });
    packagerProcess.stdout.on('data', (data) => {
      console.log(`[Bundler]: ${data}`);
    });
    process.on('error', (e) => {
      console.log('error', e);
      packagerProcess.kill();
      process.exit(1);
    });
    packagerProcess.on('exit', () => {
      resolve();
    });
    process.on('exit', () => {
      console.log('[Bundler]: Exiting...');
      packagerProcess.kill();
    });
  });
};
