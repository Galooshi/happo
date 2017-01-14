jest.mock('child_process');
const childProcess = require('child_process');
const checkBrowserVersion = require('../checkBrowserVersion');

describe('when firefox is new enough', () => {
  beforeEach(() => {
    childProcess.exec = (_, cb) => cb(null, 'Mozilla Firefox 50.0');
  });

  it('resolves', () =>
    checkBrowserVersion().then(() => {
      expect(true).toBe(true);
    }));
});

describe('when firefox is too old', () => {
  beforeEach(() => {
    childProcess.exec = (_, cb) => cb(null, 'Mozilla Firefox 47.0');
  });

  it('rejects', () =>
    checkBrowserVersion().catch((error) => {
      expect(error.message).toEqual(
        'Happo requires Firefox version 50 or later. You are using Mozilla Firefox 47.0');
    }));
});

describe('when the version string is unrecognized', () => {
  beforeEach(() => {
    childProcess.exec = (_, cb) => cb(null, 'Godzilla Firefox 47.0');
  });

  it('rejects', () =>
    checkBrowserVersion().catch((error) => {
      expect(error.message).toEqual(
        'Failed to parse Firefox version string "Godzilla Firefox 47.0"');
    }));
});
