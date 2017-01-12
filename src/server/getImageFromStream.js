const { PNG } = require('pngjs');

module.exports = function getImageFromStream(stream) {
  return new Promise((resolve, reject) => {
    stream
      .on('error', reject)
      .pipe(new PNG())
      .on('error', reject)
      .on('parsed', function parsedCallback() {
        // `this` is bound to an object with the following properties:
        //    width (number)
        //    height (number)
        //    data (array of pixels, similar to what <canvas> uses)
        //    pack (function)
        //  }
        resolve(this);
      });
  });
}
