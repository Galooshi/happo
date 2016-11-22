const path = require('path');

const config = require('./config');
const getLastResultSummary = require('./getLastResultSummary');
const pageTitle = require('./pageTitle');
const pathToSnapshot = require('./pathToSnapshot');
const prepareViewData = require('./prepareViewData');
const reviewDemoData = require('../reviewDemoData');

function reviewImageUrl(image, fileName) {
  const pathToFile = pathToSnapshot(Object.assign({}, image, { fileName }));
  return `/resource?file=${encodeURIComponent(pathToFile)}`;
}

function isValidResource(file) {
  return config.sourceFiles.includes(file) ||
    config.stylesheets.includes(file) ||
    file.startsWith(config.snapshotsFolder);
}

function createApp() {
  const express = require('express'); // eslint-disable-line global-require

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.resolve(__dirname, '../../views'));
  app.use(express.static(path.resolve(__dirname, '../../public')));
  config.publicDirectories.forEach((directory) => {
    app.use(express.static(path.join(process.cwd(), directory)));
  });


  app.get('/snapshot', (request, response) => {
    response.render('snapshot', prepareViewData({
      sourceFiles: config.sourceFiles,
      stylesheets: config.stylesheets,
      debugMode: !!request.query.description,
    }));
  });

  app.get('/resource', (request, response) => {
    const file = request.query.file;
    if (file.startsWith('http')) {
      response.redirect(file);
    } else if (isValidResource(file)) {
      response.sendFile(file, { root: process.cwd() });
    } else {
      response.sendStatus(403);
    }
  });

  app.get('/debug', (request, response) => {
    response.render('debug', prepareViewData({
      sourceFiles: config.sourceFiles,
    }));
  });


  app.get('/review', (request, response) => {
    const resultSummary = getLastResultSummary();
    const title = pageTitle(resultSummary);

    /* eslint-disable no-param-reassign */
    resultSummary.newImages.forEach((img) => {
      img.current = reviewImageUrl(img, 'current.png');
    });
    resultSummary.diffImages.forEach((img) => {
      img.current = reviewImageUrl(img, 'current.png');
      img.previous = reviewImageUrl(img, 'previous.png');
    });
    /* eslint-enable no-param-reassign */

    response.render('review', prepareViewData({
      pageTitle: title,
      appProps: Object.assign({}, resultSummary, {
        pageTitle: title,
      }),
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
  return app;
}

module.exports = {
  start() {
    return new Promise((resolve) => {
      const app = createApp();
      const expressServer = app.listen(config.port, config.bind, () => {
        console.log(`Happo listening on ${config.port}`);
        resolve({ expressServer });
      });
    });
  },
};
