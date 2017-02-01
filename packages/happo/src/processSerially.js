module.exports = function processSerially(items, fn) {
  const promises = [];
  items.reduce((prev, item) => {
    const promise = prev.then(() => fn(item));
    promises.push(promise);
    return promise;
  }, Promise.resolve());
  return Promise.all(promises);
};
