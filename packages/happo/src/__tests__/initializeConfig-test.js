const path = require('path');
const initializeConfig = require('../initializeConfig');

it('uses default config if no .happo.js file found', () => {
  expect(initializeConfig().targets).toEqual([]);
});

it('throws if specified file is not found', () => {
  expect(() => initializeConfig('foobar')).toThrow(
    'Config file does not exist: foobar');
});

it('can use relative paths', () => {
  expect(() => initializeConfig('./packages/happo-example-project/.happo.js')).not.toThrow();
});

it('can use absolute paths', () => {
  const absolutePath = path.join(process.cwd(), 'packages', 'happo-example-project', '.happo.js');
  expect(() => initializeConfig(absolutePath)).not.toThrow();
});
