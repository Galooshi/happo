const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ejs = require('ejs');

const getLastResultSummary = require('./getLastResultSummary');
const pageTitle = require('./pageTitle');
const pathToSnapshot = require('./pathToSnapshot');
const prepareViewData = require('./prepareViewData');

const AWS = require('aws-sdk'); // lazy-load to avoid

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: Bucket,
} = process.env;

AWS.config = new AWS.Config({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: 'us-west-2',
});

/**
 * Creates a bucket (or gets it if already exists).
 *
 * @return {Promise}
 */
function getOrCreateBucket(s3) {
  return new Promise((resolve, reject) => {
    s3.headBucket({ Bucket }, (headErr) => {
      if (headErr) {
        s3.createBucket({ Bucket }, (createErr) => {
          if (createErr) {
            reject(createErr);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

/**
 * Uploads an image of a particular variant (current or previous).
 *
 * @return {Promise}
 */
function uploadImage({ s3, directory, image, variant }) {
  return new Promise((resolve, reject) => {
    const imageName = `${image.description}_${image.viewportName}_${variant}.png`;
    const fileStream = fs.createReadStream(
      pathToSnapshot(Object.assign({}, image, {
        fileName: `${variant}.png`,
      }))
    );
    const uploadParams = {
      Body: fileStream,
      Bucket,
      ContentType: 'image/png',
      Key: `${directory}/${imageName}`,
    };

    s3.upload(uploadParams, (err) => {
      if (err) {
        reject(err);
      } else {
        image[variant] = // eslint-disable-line no-param-reassign
          encodeURIComponent(imageName);
        resolve();
      }
    });
  });
}

/**
 * Serializes an review page and uploads it. Resolves the promise with a URL to
 * the uploaded file.
 *
 * @return {Promise} that resolves with a URL
 */
function uploadHTMLFile({ s3, directory, diffImages, newImages, triggeredByUrl }) {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync(
      path.resolve(__dirname, '../../views/review.ejs'), 'utf8');
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
    }));
    const uploadParams = {
      Body: html,
      Bucket,
      ContentType: 'text/html',
      ContentEncoding: 'utf-8',
      Key: `${directory}/index.html`,
    };

    s3.upload(uploadParams, (err, { Location }) => {
      if (err) {
        reject(err);
      } else {
        resolve(Location);
      }
    });
  });
}

/**
 * @return {Promise} that resolves with a URL to the html document uploaded to
 *   s3.
 */
module.exports = function uploadLastResult(triggeredByUrl) {
  return new Promise((resolve, reject) => {
    const { diffImages, newImages } = getLastResultSummary();

    if (!diffImages.length && !newImages.length) {
      reject('No results to upload');
      return;
    }

    const s3 = new AWS.S3();
    getOrCreateBucket(s3).then(() => {
      const directory = crypto.randomBytes(16).toString('hex');
      const uploadPromises = [];
      diffImages.forEach((image) => {
        uploadPromises.push(
          uploadImage({ s3, directory, image, variant: 'previous' }),
          uploadImage({ s3, directory, image, variant: 'current' })
        );
      });
      newImages.forEach((image) => {
        uploadPromises.push(
          uploadImage({ s3, directory, image, variant: 'current' }));
      });

      Promise.all(uploadPromises).then(() => {
        uploadHTMLFile({ s3, directory, diffImages, newImages, triggeredByUrl })
          .then(resolve)
          .catch(reject);
      });
    }).catch(reject);
  });
};
