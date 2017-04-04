const path = require('path');
const { getLastResultSummary, pathToSnapshot } = require('happo-core');
const pageTitle = require('./pageTitle');
const prepareViewData = require('./prepareViewData');
const reviewDemoData = require('./reviewDemoData');

function reviewImageUrl(image, fileName) {
  const pathToFile = pathToSnapshot(Object.assign({}, image, { fileName }));
  return `/resource?file=${encodeURIComponent(pathToFile)}`;
}

function isValidResource(file, options) {
  return file.startsWith(options.snapshotsFolder);
}

function createApp(options) {
  const express = require('express'); // eslint-disable-line global-require

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.resolve(__dirname, '../views'));
  app.use(express.static(path.resolve(__dirname, '../public')));
  (options.publicDirectories || []).forEach((directory) => {
    app.use(express.static(path.join(process.cwd(), directory)));
  });

  app.get('/resource', (request, response) => {
    const file = request.query.file;
    if (file.startsWith('http')) {
      response.redirect(file);
    } else if (isValidResource(file, options)) {
      response.sendFile(file, { root: process.cwd() });
    } else {
      response.sendStatus(403);
    }
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
      ogImageUrl: '',
      pageTitle: title,
      appProps: Object.assign({}, resultSummary, {
        pageTitle: title,
      }),
    }));
  });

  app.get('/review-demo', (request, response) => {
    const title = pageTitle(reviewDemoData);
    response.render('review', prepareViewData({
      ogImageUrl: '',
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
  start(options) {
    return new Promise((resolve) => {
      const app = createApp(options);
      const expressServer = app.listen(options.port, options.bind, () => {
        console.log(`Happo Viewer listening on ${options.port}`);
        resolve({ expressServer });
      });
    });
  },
};
