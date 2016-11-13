const runVisualDiffs = require('../runVisualDiffs');
const server = require('../server');

describe('runVisualDiffs', () => {
  beforeAll((done) => {
    server.start().then(done);
  });

  describe('when there are no examples', () => {
    it('fails with a message', (done) => {
      runVisualDiffs().then(() => {
        throw new Error("We shouldn't end up here");
      }).catch((error) => {
        expect(error.message).toEqual('No happo examples found');
        done();
      });
    });
  });
});
