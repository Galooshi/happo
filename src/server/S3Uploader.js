const AWS = require('aws-sdk');
const crypto = require('crypto');

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: Bucket,
} = process.env;

module.exports = class S3Uploader {
  constructor() {
    AWS.config = new AWS.Config({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      region: 'us-west-2',
    });
    this.s3 = new AWS.S3();
    this.directory = crypto.randomBytes(16).toString('hex');
  }

  /**
   * Creates a bucket (or gets it if already exists).
   *
   * @return {Promise}
   */
  prepare() {
    return new Promise((resolve, reject) => {
      this.s3.headBucket({ Bucket }, (headErr) => {
        if (headErr) {
          this.s3.createBucket({ Bucket }, (createErr) => {
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
   * Uploads a file stream or a string.
   *
   * @param {stream|string} body
   * @param {string} contentType
   * @param {string} fileName
   *
   * @return {Promise}
   */
  upload({ body, contentType, contentEncoding, fileName }) {
    return new Promise((resolve, reject) => {
      const uploadParams = {
        Body: body,
        Bucket,
        ContentType: contentType,
        ContentEncoding: contentEncoding,
        Key: `${this.directory}/${fileName}`,
      };

      this.s3.upload(uploadParams, (err, { Location }) => {
        if (err) {
          reject(err);
        } else {
          resolve(Location);
        }
      });
    });
  }
};
