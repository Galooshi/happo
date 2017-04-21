const childProcess = require('child_process');
const path = require('path');

const iosBundlePath = path.join(
  __dirname,
  '..',
  'runner',
  'ios',
  'HappoRunner',
  // 'Assets',
  'main.jsbundle'
);

const iosAssetsDest = path.join(
  __dirname,
  '..',
  'runner',
  'ios',
  'HappoRunner',
  'Assets'
);

const androidBundlePath = path.join(
  __dirname,
  '..',
  'runner',
  'android',
  'HappoRunner',
  'src',
  'assets',
  'main.js'
);

const androidAssetsDest = path.join(
  __dirname,
  '..',
  'runner',
  'android',
  'HappoRunner',
  'src',
  'main',
  'res'
);

module.exports = function buildBundle(options) {
  return new Promise((resolve, reject) => {
    const command = options.bundlerCommand;
    const baseArgs = options.bundlerArgs;
    const cwd = options.packagerCwd;
    const env = options.packagerEnv;

    let bundlePath;
    let assetsDest;
    switch (options.platform) {
      case 'ios':
        bundlePath = iosBundlePath;
        assetsDest = iosAssetsDest;
        break;
      case 'android':
        bundlePath = androidBundlePath;
        assetsDest = androidAssetsDest;
        break;
      default:
        reject(new Error(`[Bundler]: Platform ${options.platform} not supported.`));
        break;
    }

    const args = [
      ...baseArgs,
      '--reset-cache', // TODO: is this necessary?
      '--platform',
      options.platform,
      '--entry-file',
      path.resolve(process.cwd(), options.bundlerEntryFile),
      '--bundle-output',
      path.resolve(bundlePath),
      '--assets-dest',
      path.resolve(assetsDest),
    ];

    const bundlerProcess = childProcess.spawn(command, args, { cwd, env });

    bundlerProcess.stderr.on('data', (data) => {
      console.error(`[Bundler]: Error:\n${data}`);
    });
    bundlerProcess.stdout.on('data', (data) => {
      console.log(`[Bundler]: ${data}`);
    });
    process.on('error', (e) => {
      console.log('error', e);
      bundlerProcess.kill();
      process.exit(1);
    });
    bundlerProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`[Bundler]: Exit with code ${code}`));
      }
    });
    process.on('exit', () => {
      console.log('[Bundler]: Exiting...');
      bundlerProcess.kill();
    });
  });
};
