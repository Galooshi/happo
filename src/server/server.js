const fs = require('fs');
const path = require('path');

const express = require('express');

const config = require('./config');
const faviconAsBase64 = require('./faviconAsBase64');
const pageTitle = require('./pageTitle');
const reviewDemoData = require('../reviewDemoData');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const CSS_FILE_PATH = path.join(__dirname, '../../public/happo-styles.css');
const JS_FILE_PATH = path.join(__dirname, '../../public/HappoApp.bundle.js');

function prepareViewData(data) {
  return Object.assign({}, {
    favicon: faviconAsBase64,
    css: fs.readFileSync(CSS_FILE_PATH, 'utf8'),
    jsCode: fs.readFileSync(JS_FILE_PATH, 'utf8'),
  }, data);
}

app.get('/debug', (request, response) => {
  response.render('debug', prepareViewData({
    sourceFiles: config.sourceFiles,
  }));
});

app.get('/review-demo', (request, response) => {
  const title = pageTitle(reviewDemoData);
  response.render('review', prepareViewData({
    pageTitle: title,
    appProps: Object.assign({}, reviewDemoData, {
      pageTitle: title,
      generatedAt: Date.now(),
    }),
  }));
});

module.exports = {
  start() {
    return new Promise((resolve) => {
      app.listen(config.port, () => {
        console.log(`Happo listening on ${config.port}`);
        resolve({ port: config.port });
      });
    });
  },
};
