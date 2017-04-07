const os = require('os');
const path = require('path');

// eslint-disable-next-line import/no-extraneous-dependencies
const rimraf = require('rimraf');

const { config } = require('happo-core');
const closeDriver = require('../closeDriver');
const initializeWebdriver = require('../initializeWebdriver');
const runVisualDiffs = require('../runVisualDiffs');
const server = require('../server');
const defaultOptions = require('../defaultOptions');

jest.mock('../checkBrowserVersion');
const checkBrowserVersion = require('../checkBrowserVersion');

const fixturePath = file => `packages/happo-target-firefox/src/__tests__/fixtures/${file}`;

describe('runVisualDiffs', () => {
  let driver;
  let startedServer;
  let options;

  beforeAll(() => {
    // eslint-disable-next-line no-underscore-dangle
    config.__setForTestingOnly({
      bind: '0.0.0.0',
      port: 5555,
      snapshotsFolder: 'snapshots',
      resultSummaryFilename: 'resultSummary.json',
      uploader: () => ({}),
      targets: [],
    });
    options = {
      ...defaultOptions,
      bind: '0.0.0.0',
      port: 5555,
      publicDirectories: ['packages/happo-target-firefox/src/__tests__/fixtures'],
      sourceFiles: [
        // this will be set by individual tests
      ],
      stylesheets: [],
    };
    return server.start(options).then(({ expressServer }) => {
      startedServer = expressServer;
      return initializeWebdriver(options).then((webdriver) => {
        driver = webdriver;
      });
    });
  });

  afterAll(() => {
    startedServer.close();
    return closeDriver(driver);
  });

  beforeEach(() => {
    options.sourceFiles = [];
    checkBrowserVersion.mockImplementation(() => Promise.resolve());
  });

  it('fails with an informative message when there are no examples', () => (
    runVisualDiffs(driver, options).then(() => {
      throw new Error('I expected an error');
    }, (error) => {
      expect(error.message).toEqual('No happo examples found');
    })
  ));

  it('fails with an informative message when startup has a scripting error', () => {
    options.sourceFiles.push(fixturePath('scriptingError.js'));

    return runVisualDiffs(driver, options).then(() => {
      throw new Error('I expected an error');
    }, (error) => {
      expect(error.message).toMatch(/JavaScript errors found/);
    });
  });

  it('fails with an informative message when an example has an error', () => {
    options.sourceFiles.push(fixturePath('errorInExample.js'));

    return runVisualDiffs(driver, options).then(() => {
      throw new Error('I expected an error');
    }, (error) => {
      expect(error.message).toMatch(/Error rendering "error"/);
    });
  });

  describe('successful runs', () => {
    let originalTimeout;

    beforeEach(() => {
      config.get().snapshotsFolder = path.join(os.tmpdir(), `happo-${Math.random()}`);
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      return new Promise((resolve) => {
        rimraf(config.get().snapshotsFolder, resolve);
      });
    });

    it('does not fail when an example renders nothing', () => {
      options.sourceFiles.push(fixturePath('renderNothingExample.js'));

      return runVisualDiffs(driver, options).then((result) => {
        expect(result.newImages.length).toEqual(1);
        expect(result.newImages[0].height).toEqual(2);
      });
    });

    it('does the right things with multiple examples', () => {
      options.sourceFiles.push(fixturePath('multipleExamples.js'));

      return runVisualDiffs(driver, options).then((firstResult) => {
        expect(firstResult.newImages.length).toEqual(3);
        expect(firstResult.diffImages.length).toEqual(0);
      }).then(() => runVisualDiffs(driver, options)).then((secondResult) => {
        expect(secondResult.newImages.length).toEqual(0);
        expect(secondResult.diffImages.length).toEqual(1);
      });
    });

    it('serves files via publicDirectories', () => {
      options.sourceFiles.push(fixturePath('tinyImage.js'));

      return runVisualDiffs(driver, options).then((result) => {
        expect(result.newImages.length).toEqual(1);
      });
    });

    it('saves the max height of the snapshots when an example shrinks', () => {
      // Use a tall example to begin with
      options.sourceFiles.push(fixturePath('tallExample.js'));

      return runVisualDiffs(driver, options).then((firstResult) => {
        expect(firstResult.newImages.length).toEqual(1);
        expect(firstResult.diffImages.length).toEqual(0);
        expect(firstResult.newImages[0].height).toEqual(200);

        // Switch to a short example
        options.sourceFiles.pop();
        options.sourceFiles.push(fixturePath('shortExample.js'));
      }).then(() => runVisualDiffs(driver, options)).then((secondResult) => {
        expect(secondResult.diffImages.length).toEqual(1);

        // We expect height to be the max of the before and after
        expect(secondResult.diffImages[0].height).toEqual(200);
      });
    });
  });
});
