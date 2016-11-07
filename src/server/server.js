const fs = require('fs');
const path = require('path');

const express = require('express');

const config = require('./config');
const faviconAsBase64 = require('./faviconAsBase64');
const pageTitle = require('./pageTitle');
const reviewDemoData = require('../reviewDemoData');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '../../views'));
app.use(express.static(path.resolve(__dirname, '../../public')));

const CSS_FILE_PATH = path.join(__dirname, '../../public/happo-styles.css');
const JS_FILE_PATH = path.join(__dirname, '../../public/HappoApp.bundle.js');

function prepareViewData(data) {
  return Object.assign({}, {
    favicon: faviconAsBase64,
    css: fs.readFileSync(CSS_FILE_PATH, 'utf8'),
    jsCode: fs.readFileSync(JS_FILE_PATH, 'utf8'),
  }, data);
}

app.get('/snapshot', (request, response) => {
  response.render('snapshot', prepareViewData({
    sourceFiles: config.sourceFiles,
    stylesheets: config.stylesheets,
    debugMode: request.params.debug,
  }));
});

app.get('/resource', (request, response) => {
  const file = request.query.file;
  if (file.startsWith('http')) {
    response.redirect(file);
  } else {
    response.sendFile(path.join(process.cwd(), file));
  }
});

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
        resolve();
      });
    });
  },
};
