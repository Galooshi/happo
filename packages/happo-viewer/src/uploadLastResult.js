const fs = require('fs');
const path = require('path');

const ejs = require('ejs');

const {
  config,
  getLastResultSummary,
  pathToSnapshot,
} = require('happo-core');
const pageTitle = require('./pageTitle');
const prepareViewData = require('./prepareViewData');

/**
 * Uploads an image of a particular variant (current or previous).
 *
 * @return {Promise}
 */
function uploadImage({ uploader, image, variant }) {
  const fileName = `${image.description}_${image.viewportName}_${variant}.png`;
  return uploader.upload({
    contentType: 'image/png',
    fileName,
    pathToFile: pathToSnapshot({
      ...image,
      fileName: `${variant}.png`,
    }),
  }).then((remoteUrl) => {
    /* eslint-disable no-param-reassign */
    image[variant] = encodeURIComponent(fileName);
    image[`${variant}Url`] = remoteUrl;
    /* eslint-enable no-param-reassign */
  });
}

/**
 * Serializes an review page and uploads it. Resolves the promise with a URL to
 * the uploaded file.
 *
 * @return {Promise} that resolves with a URL
 */
function uploadHTMLFile({ uploader, diffImages, newImages, triggeredByUrl }) {
  const template = fs.readFileSync(
    path.resolve(__dirname, '../views/review.ejs'), 'utf8');
  const title = pageTitle({ diffImages, newImages });
  const html = ejs.render(template, prepareViewData({
    appProps: {
      diffImages,
      generatedAt: Date.now(),
      newImages,
      pageTitle: title,
      triggeredByUrl,
    },
    pageTitle: title,
    ogImageUrl: (diffImages[0] || newImages[0]).currentUrl,
  }));

  return uploader.upload({
    body: html,
    contentType: 'text/html',
    contentEncoding: 'utf-8',
    fileName: 'index.html',
  });
}

/**
 * @param {String} triggeredByUrl
 * @return {Promise} that resolves with a URL to the html document uploaded to
 *   s3.
 */
module.exports = function uploadLastResult(triggeredByUrl) {
  return new Promise((resolve, reject) => {
    const { diffImages, newImages } = getLastResultSummary();

    if (!diffImages.length && !newImages.length) {
      resolve();
      return;
    }

    const uploader = config.get().uploader();
    uploader.prepare().then(() => {
      const uploadPromises = [];
      diffImages.forEach((image) => {
        uploadPromises.push(
          uploadImage({ uploader, image, variant: 'previous' }),
          uploadImage({ uploader, image, variant: 'current' }),
        );
      });
      newImages.forEach((image) => {
        uploadPromises.push(
          uploadImage({ uploader, image, variant: 'current' }));
      });

      return Promise.all(uploadPromises).then(() => {
        uploadHTMLFile({ uploader, diffImages, newImages, triggeredByUrl })
          .then(resolve)
          .catch(reject);
      });
    }).catch(reject);
  });
};
