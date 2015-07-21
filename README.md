# Likadan

Likadan is a command-line tool to visually diff JavaScript components.

## Installation

Likadan comes bundled as a gem. To install it, run `gem install likadan`.

## Configuration

Likadan loads configuration in one of the following ways:

- From a YAML file specified via a `LIKADAN_CONFIG_FILE` environment variable
- From `.likadan.yaml` in the current working directory

```yaml
source_files:
 - application.js
 - likadan-examples.js
stylesheets:
 - application.css
snapshots_folder: ./snapshots
s3_access_key_id: <your acccess key id>
s3_secret_access_key: <your secret acccess key>
```

## Command line tools

### `likadan`

This command will fire up a Firefox instance and take snapshots of all your
likadan examples.

### `likadan review`

Once `likadan` has finished, run `likadan review` from the command line. This
will open a page that compares the latest run's snapshots against the
previously accepted snapshots. You can then approve or reject the snapshots for
the next run.

### `likadan upload_diffs`

Uploads all current diff images to an Amazon S3 account and reports back URLs
to access those diff images. Requires the `s3_access_key_id` and
`s3_secret_access_key` configuration options.

### `likadan prune`

Recursively removes everything in the snapshots folder (configured through
`snapshot_folder`).
