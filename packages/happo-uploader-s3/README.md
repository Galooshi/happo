# Happo Uploader: Amazon S3

## Installation

If you haven't already installed `happo` you will need to do that:
```bash
npm install --save-dev happo
```

To get the s3 uploader, you will install from npm:

```bash
npm install --save-dev happo-uploader-s3
```

### Usage

This package Uploads all current diff images to an Amazon S3 account and reports back URLs to
access those diff images. Requires that `S3_ACCESS_KEY_ID`,
`S3_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME` are specified as environment
variables. `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` will be the credentials
Happo uses to access the bucket named `S3_BUCKET_NAME`.

`S3_BUCKET_PATH` can be set as an environment variable to specify a directory
path for where you want diff images uploaded within the S3 bucket.

Furthermore, `S3_REGION` controls what
[region](http://docs.aws.amazon.com/general/latest/gr/rande.html) is used to
find or create the bucket.

You can set these in the session by using `export`:

```sh
export S3_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_VALUE>
export S3_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY_VALUE>
export S3_BUCKET_NAME=<YOUR_BUCKET_NAME>

happo upload
```

or by adding them in the beginning of the command:

```sh
S3_ACCESS_KEY_ID=<...> S3_SECRET_ACCESS_KEY=<...> ... happo upload
```

If you want the diff page to link back to a commit/PR, you can pass in a URL as
the argument to `happo upload`. E.g.

```sh
happo upload "https://test.example"
```

To debug uploading, override the `uploader` configuration option with a
debug-enabled `S3Uploader` instance. This will print additional information to
`stderr`.

```js
const S3Uploader = require('happo/lib/server/S3Uploader');

module.exports = {
  // ...
  uploader: () => new S3Uploader({ debug: true }),
  // ...
}
```
