const config = require('../config');
const runVisualDiffs = require('../runVisualDiffs');
const server = require('../server');

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
      runVisualDiffs().then(() => {
        throw new Error("We shouldn't end up here");
      }).catch((error) => {
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
      runVisualDiffs().then(() => {
        throw new Error("We shouldn't end up here");
      }).catch((error) => {
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
      runVisualDiffs().then(() => {
        throw new Error("We shouldn't end up here");
      }).catch((error) => {
        expect(error.message).toMatch(/Error rendering "foo"/);
        done();
      });
    });
  });
});
