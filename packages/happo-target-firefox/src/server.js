const path = require('path');

const prepareViewData = require('happo-viewer/lib/prepareViewData');

function isValidResource(file, options) {
  return options.sourceFiles.includes(file) ||
    options.stylesheets.includes(file) ||
    file.startsWith(options.snapshotsFolder);
}

function createApp(options) {
  const express = require('express'); // eslint-disable-line global-require

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.resolve(__dirname, '../views'));
  app.use(express.static(path.resolve(__dirname, '../public')));
  options.publicDirectories.forEach((directory) => {
    app.use(express.static(path.join(process.cwd(), directory)));
  });


  app.get('/snapshot', (request, response) => {
    response.render('snapshot', prepareViewData({
      sourceFiles: options.sourceFiles,
      stylesheets: options.stylesheets,
      debugMode: !!request.query.description,
    }));
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

  app.get('/debug', (request, response) => {
    response.render('debug', prepareViewData({
      sourceFiles: options.sourceFiles,
    }));
  });

  return app;
}

module.exports = {
  start(options) {
    return new Promise((resolve) => {
      const app = createApp(options);
      const expressServer = app.listen(options.port, options.bind, () => {
        console.log(`Happo Firefox Target listening on ${options.port}`);
        resolve({ expressServer });
      });
    });
  },
};
