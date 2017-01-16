module.exports = {
  name: 'firefox',
  bind: 'localhost',
  port: 4567,
  scriptTimeout: 30000,
  publicDirectories: [],
  sourceFiles: [],
  stylesheets: [],
  viewports: {
    large: {
      width: 1024,
      height: 768,
    },
    medium: {
      width: 640,
      height: 888,
    },
    small: {
      width: 320,
      height: 444,
    },
    desktop: {
      width: 1024,
      height: 768,
    },
    mobile: {
      width: 320,
      height: 444,
    },
  },
};
