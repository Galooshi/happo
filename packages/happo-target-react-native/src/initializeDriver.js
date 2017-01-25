const path = require('path');
const wd = require('wd');
const childProcess = require('child_process');

const appiumVersion = require('appium/package.json').version;

const startAppium = ({
  appiumCwd,
  appiumEnv,
  appiumServerPort,
}) => (
  new Promise((resolve) => {
    const nodeBin = childProcess.execSync('npm bin');
    const appiumPath = path.join(nodeBin.toString('utf8').trim(), 'appium');
    const args = [
      '-p',
      String(appiumServerPort),
    ];
    const appiumProc = childProcess.spawn(appiumPath, args, { cwd: appiumCwd, env: appiumEnv });

    let loadedAppium = false;
    appiumProc.stdout.on('data', (data) => {
      if (loadedAppium) return;
      console.log(`[Appium]: ${data}`);
      if (data.indexOf('Appium REST http interface listener started') >= 0) {
        loadedAppium = true;
        resolve();
      }
    });
    appiumProc.stderr.on('data', (data) => {
      console.log(`[Appium]: Error ${data}`);
      appiumProc.kill();
    });
    process.on('error', (e) => {
      console.log('error', e);
    });
    process.on('exit', (e) => {
      console.log(e);
      console.log('[Appium]: Exiting...');
      appiumProc.kill();
    });
  })
);

const startDriver = ({
  appiumServerHost,
  appiumServerPort,
  capabilities,
  runnerAppPath,
  platformName,
  platformVersion,
  deviceOrientation,
  deviceName,
  newCommandTimeout,
}) => (
  new Promise((resolve) => {
    const caps = {
      ...capabilities,
      browserName: '',
      autoLaunch: 'true',
      app: runnerAppPath,
      'appium-version': appiumVersion,
      newCommandTimeout,
      deviceOrientation,
      platformName,
      platformVersion,
      deviceName,
    };

    const serverConfig = {
      host: appiumServerHost,
      port: appiumServerPort,
    };

    console.log('[DRIVER]: init');

    const driver = wd.promiseChainRemote(serverConfig);

    driver.on('status', (info) => {
      console.log(info);
    });
    driver.on('command', (method, commandPath, data) => {
      console.log(` > ${method}`, commandPath, data || '');
    });

    driver.init(caps, (error) => {
      console.log('[DRIVER]: started');
      if (error) {
        console.log('[DRIVER]: error', error);
        process.exit(1);
      }
      resolve(driver);
    });
  })
);

module.exports = function initializeDriver(options) {
  console.log('[DRIVER]: starting it up');
  return startAppium(options).then(() => startDriver(options));
};
