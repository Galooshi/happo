const path = require('path');

const iosAppPath = path.join(
  __dirname, // path of this file
  '..', // root of this module
  'runner',
  'ios',
  'build',
  'Build',
  'Products',
  'Debug-iphonesimulator',
  'HappoRunner.app',
);

const androidAppPath = path.join(
  __dirname, // path of this file
  '..', // root of this module
  'runner',
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'app-debug.apk',
);

// `${process.cwd()}/../android/airbnb/build/outputs/apk/app-debug.apk`;

function fail(message) {
  /* eslint-disable no-console */
  console.error('Happo Target React Native config validation failed:');
  console.error(message);
  process.exit(1);
}


function validatePassedOptions(options) {
  if (typeof options.platform !== 'string') {
    fail(`Expected \`platform\` to be string. Found ${typeof options.platform} instead.`);
    return false;
  }
  switch (options.platform.toLowerCase()) {
    case 'ios':
    case 'android':
      break;
    default:
      fail(`Expected \`platform\` to be one of ['ios', 'android']. Found '${options.platform}'.`);
      return false;
  }
  return true;
}

const platformDefaults = {
  ios: {
    runnerAppPath: iosAppPath,
    platformName: 'iOS',
    deviceOrientation: 'portrait',
  },
  android: {
    runnerAppPath: androidAppPath,
    platformName: 'Android',
    deviceOrientation: 'portrait',
  },
};

// non-overridable capabilities
const platformCapabilities = {
  ios: {
    automationName: 'xcuitest',
  },
  android: {
    appPackage: 'com.HappoRunner',
    appActivity: '.MainActivity',
  },
};

module.exports = passedOptions => validatePassedOptions(passedOptions) && ({
  name: 'react-native',
  port: 5000, // websockets port
  packagerCommand: 'node',
  packageArgs: [
    require.resolve('react-native/local-cli/cli'),
    'start',
  ],
  packagerCwd: process.cwd(),
  packagerEnv: process.env,

  appiumCwd: process.cwd(),
  appiumEnv: process.env,
  appiumServerHost: 'localhost',
  appiumServerPort: 4734,

  // caps
  newCommandTimeout: 1000 * 60 * 5, // 5 minutes

  // default capabilities
  ...platformDefaults[passedOptions.platform.toLowerCase()],
  ...passedOptions,

  // non-overridable capabilities
  capabilities: platformCapabilities[passedOptions.platform.toLowerCase()],
});
