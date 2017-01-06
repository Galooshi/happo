const wd = require('wd');
const childProcess = require('child_process');
const { config } = require('./config');

const startAppium = ({ appiumServerConfig }) => (
  new Promise((resolve) => {
    const appiumProc = childProcess.spawn('./node_modules/.bin/appium', ['-p', appiumServerConfig.port]);

    let loadedAppium = null;
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

let driver;

const startDriver = ({ caps, appiumServerConfig }) => (
  new Promise((resolve) => {
    console.log('[DRIVER]: init');

    driver = wd.promiseChainRemote(appiumServerConfig);

    driver.on('status', (info) => {
      console.log(info);
    });
    driver.on('command', (meth, path, data) => {
      console.log(` > ${meth}`, path, data || '');
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

const TIMEOUT_TIME = 1000 * 60 * 5; // 5 minutes

// TODO(lmr): read user config
const appiumServerConfig = {
  host: 'localhost',
  port: 4734,
};

const filePath =
  `${process.cwd()}/native/ios/build/Build/Products/Debug-iphonesimulator/happo.app`;

const caps = {
  browserName: '',
  'appium-version': '1.6.3',
  autoLaunch: 'true',
  newCommandTimeout: TIMEOUT_TIME,
  app: filePath,
  deviceOrientation: 'portrait',
  platformName: 'iOS',
  platformVersion: '9.3',
  deviceName: 'iPhone 6',
  automationName: 'xcuitest',
};

module.exports = function initializeIOSdriver() {
  console.log('[DRIVER]: starting it up');
  return startAppium({ appiumServerConfig })
    .then(() => startDriver({ caps, appiumServerConfig }));
};
