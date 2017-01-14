const faviconAsBase64 = require('./faviconAsBase64');

module.exports = function prepareViewData(data) {
  return {
    favicon: faviconAsBase64,
    ...data,
  };
};
