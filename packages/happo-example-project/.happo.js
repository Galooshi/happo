const FirefoxTarget = require('happo-target-firefox');
const S3Uploader = require('../happo-uploader-s3');

module.exports = {
  // bind: '0.0.0.0',
  // port: 5555,
  uploader: () => new S3Uploader(),
  targets: [
    new FirefoxTarget({
      bind: '0.0.0.0',
      port: 5555,
      sourceFiles: [
        'example.js',
      ],
      stylesheets: [
        'css/styles.css',
      ],
      publicDirectories: [
        'public-root',
      ],
      viewports: {
        desktop: {
          width: 1024,
          height: 768,
        },
        mobile: {
          width: 320,
          height: 444,
        },
      },
    }),
  ],
};
