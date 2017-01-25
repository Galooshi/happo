const parseDataUri = require('parse-data-uri');
const { PNG } = require('pngjs');

function getImageFromDataURI(uri) {
  return new Promise((resolve, reject) => {
    const img = parseDataUri(uri);
    const png = new PNG();
    png.parse(img.data, (err) => {
      if (err) reject(err);
      resolve(png);
    });
  });
}

module.exports = getImageFromDataURI;
