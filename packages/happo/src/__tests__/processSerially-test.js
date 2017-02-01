const processSerially = require('../processSerially');

it('returns the data in order', () => {
  const data = ['a', 'b', 'c'];
  const fn = x => Promise.resolve(x);
  return processSerially(data, fn).then((results) => {
    expect(results).toEqual(data);
  });
});

it('runs serially', () => {
  const data = [50, 0, 8];
  const fn = x => new Promise((resolve) => {
    setTimeout(() => resolve(x), x);
  });
  return processSerially(data, fn).then((results) => {
    expect(results).toEqual(data);
  });
});
