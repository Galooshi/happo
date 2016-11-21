const os = require('os');
const path = require('path');

const rimraf = require('rimraf');

const config = require('../config');
const runVisualDiffs = require('../runVisualDiffs');
const server = require('../server');

describe('runVisualDiffs', function () { // eslint-disable-line func-names
  beforeAll(() => {
    config.publicDirectories = ['src/server/__tests__/fixtures'];
    return server.start().then(({ expressServer }) => {
      this.expressServer = expressServer;
    });
  });

  afterAll(() => this.expressServer.close());

  beforeEach(() => {
    this.originalConfig = Object.assign({}, config);
  });

  afterEach(() => {
    // TODO figure out a better way to mock config
    Object.assign(config, this.originalConfig);
  });

  describe('when there are no examples', () => {
    it('fails with an informative message', () =>
      runVisualDiffs().catch((error) => {
        expect(error.message).toEqual('No happo examples found');
      }));
  });

  describe('when there is a scripting error at startup', () => {
    beforeEach(() => {
      config.sourceFiles = ['src/server/__tests__/fixtures/scriptingError.js'];
    });

    it('fails with an informative message', () =>
      runVisualDiffs().catch((error) => {
        expect(error.message).toMatch(/JavaScript errors found/);
      }));
  });

  describe('when there is an error in an example', () => {
    beforeEach(() => {
      config.sourceFiles = ['src/server/__tests__/fixtures/errorInExample.js'];
    });

    it('fails with an informative message', () =>
      runVisualDiffs().catch((error) => {
        expect(error.message).toMatch(/Error rendering "foo"/);
      }));
  });

  describe('successful runs', () => {
    beforeEach(() => {
      config.snapshotsFolder = path.join(os.tmpdir(), `happo-${Math.random()}`);
      this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(() => {
      rimraf.sync(config.snapshotsFolder);
      jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
    });

    describe('with multiple examples', () => {
      beforeEach(() => {
        config.sourceFiles = ['src/server/__tests__/fixtures/multipleExamples.js'];
      });

      it('does the right things', (done) =>
        runVisualDiffs().then((firstResult) => {
          expect(firstResult.newImages.length).toEqual(3);
          expect(firstResult.diffImages.length).toEqual(0);
        }).then(runVisualDiffs).then((secondResult) => {
          expect(secondResult.newImages.length).toEqual(0);
          expect(secondResult.diffImages.length).toEqual(1);
          done();
        }));
    });

    describe('serving files via publicDirectories', () => {
      beforeEach(() => {
        config.sourceFiles = ['src/server/__tests__/fixtures/tinyImage.js'];
      });

      it('succeeds', () =>
        runVisualDiffs().then((result) =>
          expect(result.newImages.length).toEqual(1)));
    });
  });
});
