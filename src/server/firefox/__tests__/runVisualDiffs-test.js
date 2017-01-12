const os = require('os');
const path = require('path');

const jest = require('jest');
const rimraf = require('rimraf');

const { config } = require('../../config');
const closeDriver = require('../closeDriver');
const initializeWebdriver = require('../initializeWebdriver');
const runVisualDiffs = require('../runVisualDiffs');
const server = require('../../server');

jest.mock('../checkBrowserVersion');
const checkBrowserVersion = require('../checkBrowserVersion');

describe('runVisualDiffs', () => {
  let driver;
  let startedServer;
  let originalConfig;

  beforeAll(() => {
    config.publicDirectories = ['src/server/__tests__/fixtures'];
    return server.start().then(({ expressServer }) => {
      startedServer = expressServer;
      return initializeWebdriver().then((webdriver) => {
        driver = webdriver;
      });
    });
  });

  afterAll(() => {
    startedServer.close();
    return closeDriver(driver);
  });

  beforeEach(() => {
    originalConfig = { ...config };
    checkBrowserVersion.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    // TODO figure out a better way to mock config
    Object.assign(config, originalConfig);
  });

  it('fails with an informative message when there are no examples', () => (
    runVisualDiffs(driver).then(() => {
      throw new Error('I expected an error');
    }, (error) => {
      expect(error.message).toEqual('No happo examples found');
    })
  ));

  it('fails with an informative message when startup has a scripting error', () => {
    config.sourceFiles = ['src/server/__tests__/fixtures/scriptingError.js'];

    return runVisualDiffs(driver).then(() => {
      throw new Error('I expected an error');
    }, (error) => {
      expect(error.message).toMatch(/JavaScript errors found/);
    });
  });

  it('fails with an informative message when an example has an error', () => {
    config.sourceFiles = ['src/server/__tests__/fixtures/errorInExample.js'];

    return runVisualDiffs(driver).then(() => {
      throw new Error('I expected an error');
    }, (error) => {
      expect(error.message).toMatch(/Error rendering "error"/);
    });
  });

  describe('successful runs', () => {
    let originalTimeout;

    beforeEach(() => {
      config.snapshotsFolder = path.join(os.tmpdir(), `happo-${Math.random()}`);
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      return new Promise((resolve) => {
        rimraf(config.snapshotsFolder, resolve);
      });
    });

    it('does not fail when an example renders nothing', () => {
      config.sourceFiles = ['src/server/__tests__/fixtures/renderNothingExample.js'];

      return runVisualDiffs(driver).then((result) => {
        expect(result.newImages.length).toEqual(1);
        expect(result.newImages[0].height).toEqual(1);
      });
    });

    it('does the right things with multiple examples', () => {
      config.sourceFiles = ['src/server/__tests__/fixtures/multipleExamples.js'];

      return runVisualDiffs(driver).then((firstResult) => {
        expect(firstResult.newImages.length).toEqual(3);
        expect(firstResult.diffImages.length).toEqual(0);
      }).then(() => runVisualDiffs(driver)).then((secondResult) => {
        expect(secondResult.newImages.length).toEqual(0);
        expect(secondResult.diffImages.length).toEqual(1);
      });
    });

    it('serves files via publicDirectories', () => {
      config.sourceFiles = ['src/server/__tests__/fixtures/tinyImage.js'];

      return runVisualDiffs(driver).then((result) => {
        expect(result.newImages.length).toEqual(1);
      });
    });

    it('saves the max height of the snapshots when an example shrinks', () => {
      // Use a tall example to begin with
      config.sourceFiles = ['src/server/__tests__/fixtures/tallExample.js'];

      return runVisualDiffs(driver).then((firstResult) => {
        expect(firstResult.newImages.length).toEqual(1);
        expect(firstResult.diffImages.length).toEqual(0);
        expect(firstResult.newImages[0].height).toEqual(100);

        // Switch to a short example
        config.sourceFiles = ['src/server/__tests__/fixtures/shortExample.js'];
      }).then(() => runVisualDiffs(driver)).then((secondResult) => {
        expect(secondResult.diffImages.length).toEqual(1);

        // We expect height to be the max of the before and after
        expect(secondResult.diffImages[0].height).toEqual(100);
      });
    });
  });
});
