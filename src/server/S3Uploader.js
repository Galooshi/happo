const crypto = require('crypto');
const fs = require('fs');

const AWS = require('aws-sdk');

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: Bucket,
  S3_BUCKET_PATH,
  S3_REGION,
} = process.env;

module.exports = class S3Uploader {
  constructor({ debug } = {}) {
    this.debug = debug;
    this.debugLog(`Initializing S3 configuration for ${S3_ACCESS_KEY_ID}`);

    AWS.config = new AWS.Config({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      region: S3_REGION || 'us-west-2',
      logger: debug && process.stderr,
    });

    this.s3 = new AWS.S3();

    this.directory = [
      S3_BUCKET_PATH,
      crypto.randomBytes(16).toString('hex'),
    ].filter(Boolean).join('/');

    this.debugLog(`Setting S3 directory to ${this.directory}`);
  }

  debugLog(message) {
    if (!this.debug) {
      return;
    }

    // We print to stderr to avoid messing with the end result (the link to the
    // uploaded HTML file)
    process.stderr.write(`${message}\n`);
  }

  /**
   * Creates a bucket (or gets it if already exists).
   *
   * @return {Promise}
   */
  prepare() {
    return new Promise((resolve, reject) => {
      this.debugLog(`Checking for bucket ${Bucket}`);

      this.s3.headBucket({ Bucket }, (headErr) => {
        if (headErr) {
          this.debugLog(`Bucket not found, creating new bucket ${Bucket}`);
          this.s3.createBucket({ Bucket }, (createErr) => {
            if (createErr) {
              this.debugLog(`Bucket creation failed ${Bucket}`);
              reject(createErr);
            } else {
              this.debugLog(`Bucket creation successful ${Bucket}`);
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
   * @param {string} body
   * @param {string} pathToFile
   * @param {string} contentType
   * @param {string} fileName
   *
   * @return {Promise}
   */
  upload({ body, pathToFile, contentType, contentEncoding, fileName }) {
    return new Promise((resolve, reject) => {
      if (!body) {
        body = fs.createReadStream(pathToFile); // eslint-disable-line no-param-reassign
      }
      const uploadParams = {
        Body: body,
        Bucket,
        ContentType: contentType,
        ContentEncoding: contentEncoding,
        Key: `${this.directory}/${fileName}`,
      };

      this.debugLog('Attempting upload');
      this.s3.upload(uploadParams, (err, { Location }) => {
        if (err) {
          this.debugLog('Upload failed');
          reject(err);
        } else {
          resolve(Location);
        }
      });
    });
  }
};
