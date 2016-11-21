const fs = require('fs');
const path = require('path');

const faviconAsBase64 = require('./faviconAsBase64');

const CSS_FILE_PATH = path.join(__dirname, '../../public/happo-styles.css');
const JS_FILE_PATH = path.join(__dirname, '../../public/HappoApp.bundle.js');

module.exports = function prepareViewData(data) {
  return Object.assign({}, {
    favicon: faviconAsBase64,
    css: fs.readFileSync(CSS_FILE_PATH, 'utf8'),
    jsCode: fs.readFileSync(JS_FILE_PATH, 'utf8'),
  }, data);
};
