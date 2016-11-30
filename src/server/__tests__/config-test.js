const path = require('path');

jest.mock('fs');
const fs = require('fs');

const { initialize } = require('../config');

beforeEach(() => {
  fs.existsSync = jest.fn(() => false);
});

it('uses default config if no .happo.js file found', () => {
  expect(initialize().sourceFiles).toEqual([]);
});

it('throws if specified file is not found', () => {
  expect(() => initialize('foobar')).toThrow(
    'Config file does not exist: foobar');
});

it('can use relative paths', () => {
  fs.existsSync = jest.fn(() => true);
  expect(() => initialize('example-project/.happo.js')).not.toThrow();
});

it('can use absolute paths', () => {
  fs.existsSync = jest.fn(() => true);
  const absolutePath = path.join(process.cwd(), 'example-project', '.happo.js');
  expect(() => initialize(absolutePath)).not.toThrow();
});
