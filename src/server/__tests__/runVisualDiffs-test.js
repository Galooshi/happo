const config = require('../config');
const runVisualDiffs = require('../runVisualDiffs');
const server = require('../server');

function notExpected(error) {
  throw new Error("We shouldn't end up here", error);
}

describe('runVisualDiffs', function () { // eslint-disable-line func-names
  beforeAll((done) => {
    server.start().then(done);
  });

  beforeEach(() => {
    this.originalConfig = Object.assign({}, config);
  });

  afterEach(() => {
    // TODO figure out a better way to mock config
    Object.assign(config, this.originalConfig);
  });

  describe('when there are no examples', () => {
    it('fails with an informative message', (done) => {
      runVisualDiffs().then(notExpected).catch((error) => {
        expect(error.message).toEqual('No happo examples found');
        done();
      });
    });
  });

  describe('when there is a scripting error at startup', () => {
    beforeEach(() => {
      config.sourceFiles = ['src/server/__tests__/fixtures/scriptingError.js'];
    });

    it('fails with an informative message', (done) => {
      runVisualDiffs().then(notExpected).catch((error) => {
        expect(error.message).toMatch(/JavaScript errors found/);
        done();
      });
    });
  });

  describe('when there is an error in an example', () => {
    beforeEach(() => {
      config.sourceFiles = ['src/server/__tests__/fixtures/errorInExample.js'];
    });

    it('fails with an informative message', (done) => {
      runVisualDiffs().then(notExpected).catch((error) => {
        expect(error.message).toMatch(/Error rendering "foo"/);
        done();
      });
    });
  });

  describe('with multiple examples', () => {
    beforeEach(() => {
      config.sourceFiles = ['src/server/__tests__/fixtures/multipleExamples.js'];
      config.snapshotsFolder = `tmp-${Math.random()}`;
      this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    });

    afterEach(() => {
      // TODO: clean out snapshotsfolder
      // fs.unlinkSync(config.snapshotsFolder);

      jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
    });

    it('does the right things', (done) => {
      runVisualDiffs().then((firstResult) => {
        expect(firstResult.newImages.length).toEqual(3);
        expect(firstResult.diffImages.length).toEqual(0);
      }).then(runVisualDiffs).then((secondResult) => {
        expect(secondResult.newImages.length).toEqual(0);
        expect(secondResult.diffImages.length).toEqual(1);
        done();
      })
      .catch(notExpected);
    });
  });
});
