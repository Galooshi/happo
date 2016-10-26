const fs = require('fs');
const path = require('path');

const express = require('express');

const config = require('./config');
const faviconAsBase64 = require('./faviconAsBase64');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const CSS_FILE_PATH = path.join(__dirname, '../public/happo-styles.css');

function prepareViewData(data) {
  return Object.assign({}, {
    favicon: faviconAsBase64,
    css: fs.readFileSync(CSS_FILE_PATH, 'utf8'),
  }, data);
}

app.get('/debug', (request, response) => {
  response.render('debug', prepareViewData({
    sourceFiles: config.sourceFiles,
  }));
});

app.listen(config.port, () => {
  console.log('Happo listening on http://localhost:' + config.port);
});
