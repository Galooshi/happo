const ReactNativeTarget = require('happo-target-react-native');
const S3Uploader = require('../happo-uploader-s3');

module.exports = {
  uploader: () => new S3Uploader(),
  targets: [
    new ReactNativeTarget({
      platform: 'ios',
      platformVersion: '10.3',
      deviceName: 'iPhone 7',
    }),
    new ReactNativeTarget({
      platform: 'android',
      platformVersion: '6.0',
      deviceName: 'Android Emulator',
    }),
    new ReactNativeTarget({
      platform: 'windows',
    }),
  ],
};
