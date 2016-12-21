# Happo <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![Build Status][travis-svg]][travis-url]
[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

[package-url]: https://npmjs.org/package/happo
[npm-version-svg]: http://versionbadg.es/Galooshi/happo.svg
[travis-svg]: https://travis-ci.org/Galooshi/happo.svg
[travis-url]: https://travis-ci.org/Galooshi/happo
[deps-svg]: https://david-dm.org/Galooshi/happo.svg
[deps-url]: https://david-dm.org/Galooshi/happo
[dev-deps-svg]: https://david-dm.org/Galooshi/happo/dev-status.svg
[dev-deps-url]: https://david-dm.org/Galooshi/happo#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/happo.png?downloads=true&stars=true
[license-image]: http://img.shields.io/npm/l/happo.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/happo.svg
[downloads-url]: http://npm-stat.com/charts.html?package=happo

Happo is a command-line tool to visually diff JavaScript components. [Read
more][end-of-visual-regressions].

[end-of-visual-regressions]: https://medium.com/brigade-engineering/the-end-of-visual-regressions-b6b5c3d810f

## Installation

Happo comes bundled as an npm package. To install it, run

```sh
npm install -g happo
````

You'll also need Firefox installed on the machine. Happo uses
[selenium-webdriver](https://github.com/SeleniumHQ/selenium) under the hood,
and will support whatever version Selenium supports. Happo currently works best
with _Firefox 47.0.1_.

## Introduction

Happo works by running twice. It first needs to run on the "current" version of
the code (generally latest `master`) to take screenshots of the current version
of your components. Then, it runs on the "next" version of the code (generally
your working branch) to take new screenshots of your components and compare them
to the earlier version.

To set this up, you define a set of examples that Happo will grab snapshots for.
If a previous snapshot exists for a component, Happo will diff the new snapshot
with the previous. If a diff is found, a visual representation of the changes
will be constructed. You can then use that diff image to decide whether a visual
regression has been introduced or not, and take appropriate action based on that
information.

![Demo of Happo in action](happo_demo.gif)

## Defining examples

You define your examples in a JavaScript file and include it in the
`sourceFiles` [configuration](#configuration) option.

Here's an example of a button component being added to a Happo suite:

```javascript
happo.define('button', () => {
  var elem = document.createElement('button');
  elem.setAttribute('class', 'button');
  elem.innerHTML = 'Submit';
  document.body.appendChild(elem);
});
```

Here's an example using [React](https://facebook.github.io/react/)):

```jsx
happo.define('<MyReactComponent>', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const component = (
    <MyReactComponent
      foo={1}
      bar='baz'
    />
  );
  ReactDOM.render(component, div);
});
```

Examples are responsible for rendering the element into the DOM. This is because
a lot of frameworks (e.g. [React](https://facebook.github.io/react/)) like to
maintain control over the DOM. A helper method to reduce some of the boilerplate
is probably a good idea in your project.

### Setting viewport sizes

By default, Happo renders examples in a 1024px-wide window. If you have
components that render differently depending on available screen size you can
use the `viewports` option in the object passed in as the second argument to
`happo.define`. These need to correspond to configured `viewports` in the
`.happo.js` file. Happo comes pre-configured with three default sizes:
`large` (1024x768), `medium` (640x888), and `small` (320x444).

```javascript
happo.define('responsive component', () => {
  var elem = document.createElement('div');
  elem.setAttribute('class', 'responsive-component');
  document.body.appendChild(elem);
}, { viewports: ['large', 'small'] });
```

### Async examples

If your examples need to do something asynchronous before they finish rendering,
you can return a `Promise` from your define method. Happo will wait for the
`Promise` to resolve before taking a screenshot.

```javascript
happo.define('async component', () => {
  return new Promise(function(resolve) {
    var elem = document.createElement('div');
    document.body.appendChild(elem);
    setTimeout(function() {
      elem.innerHTML = 'Async content loaded';
      resolve();
    }, 100);
  });
});
```

Alternatively, use the `done` callback passed in to the define method.

```javascript
happo.define('async component', (done) => {
  var elem = document.createElement('div');
  document.body.appendChild(elem);
  setTimeout(() => {
    elem.innerHTML = 'Async content loaded';
    done();
  }, 100);
});
```

### Focusing on examples

During development, you might want to focus on a single example. In those
situations, you can use the `happo.fdefine` function instead of `happo.define`.
Using `fdefine` will cause `happo` to only run for the examples that are using
`fdefine` and skip all examples using `define`.

```javascript
// This example will be skipped because it is not being "focused".
happo.define('button', () => {
  var elem = document.createElement('button');
  elem.setAttribute('class', 'button');
  elem.innerHTML = 'Submit';
  document.body.appendChild(elem);
});

// This example will not be skipped because it is being "focused".
happo.fdefine('different button', () => {
  var elem = document.createElement('button');
  elem.setAttribute('class', 'button button--send');
  elem.innerHTML = 'Send';
  document.body.appendChild(elem);
});
```

### Cleaning up the DOM

Happo will clean up the DOM between rendered examples. If you need more control
over the clean-up process you can override `happo.cleanOutElement` with your own
implementation. This is useful if you need to clean up event listeners for
instance, or if you use [React](https://facebook.github.io/react/) and need to
unmount components.

```javascript
happo.cleanOutElement = function(element) {
  React.unmountComponentAtNode(element);
};
```

### Controlling root nodes

By default, Happo will compute a bounding rectangle used when snapshotting
based on the dimensions of all root DOM nodes found in the `<body>` element and
their descendant nodes. You can override this default by implementing a
`happo.getRootNodes` function. If you use
[React](https://facebook.github.io/react/) you might want to use this to better
control the size of the snapshot.

```javascript
happo.getRootNodes = function() {
  return document.querySelectorAll('[data-reactroot]');
};
```

## Configuration

Happo loads configuration in one of the following ways:

- From a JavaScript file specified via a `HAPPO_CONFIG_FILE` environment variable
- From `.happo.js` in the current working directory

### Example configuration

```js
module.exports = {
  // Control the interface on which the local server listens (defaults to 'localhost')
  // (default: 'localhost')
  bind: '0.0.0.0',

  // Control the port used for the local server
  // (default: 4567)
  port: 7777,

  // List javascript source files. These can be files or raw URLs.
  // (default: [])
  sourceFiles: [
    'https://unpkg.com/jquery@3.1.1',
    'application.js',
    'happo-examples.js',
  ],

  // List css source files. These can also be files or raw URLs.
  // (default: [])
  stylesheets: [
    'application.css',
  ],

  // List directories where public files are accessible (useful for e.g. font files)
  // (default: [])
  publicDirectories: [
    'public',
  ],

  // Specify the folder where snapshots are saved
  // (default: 'snapshots')
  snapshotsFolder: 'happo-snapshots',

  // Configure the window size when taking snapshots
  // (defaults shown below)
  viewports: {
    large: {
      width: 1024,
      height: 768,
    },
    medium: {
      width: 640,
      height: 888,
    },
    small: {
      width: 320,
      height: 444,
    },
  },
};
```

## Command line tools

### `happo run`

This command will fire up a Firefox instance and take snapshots of all your
Happo examples.

### `happo review`

Once `happo run` has finished, run `happo review` from the command line. This
will open a page that compares the latest run's snapshots against the previous
snapshots.

### `happo debug`

If you want to debug rendering your examples, you can run `happo debug`. This
will open a browser window pointing at `/debug`, listing all your examples. If
you click one of them, the example will be rendered in isolation and you can do
use your developer tools to debug.

### `happo upload [<triggeredByUrl>]`

Uploads all current diff images to an Amazon S3 account and reports back URLs to
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

To debug uploading, you can use the `--debug` flag which will print additional
information to `stderr`.

### `happo upload-test`

Uploads a small text file to an AWS S3 account. This is useful if you want to
test your S3 configuration. Uses the same configuration as [`happo
upload`](#happo-upload-triggeredbyurl) does. As with `happo upload`, you can
apply a `--debug` flag here for a more verbose output.

```sh
happo upload-test --debug
```

## Running in a CI environment

The main purpose for Happo is for it to be run in a CI (Continuous
Integration) environment. The command line tools provided are designed to be
used as building blocks in a script that you can run in
[Travis](https://travis-ci.org/), [Jenkins](https://jenkins-ci.org/) and other
Continuous Integration environments.

Below is an example of how you can use Happo to test if a commit introduces
any visual change.

1. Check out the commit previous to the one to test (e.g. `git checkout HEAD^`)
1. (optionally) build your JavaScript and/or CSS
1. Run `happo run` to generate previous snapshots
1. Check out the commit to test
1. (optionally) build your JavaScript and/or CSS
1. Run `happo run` to diff against previously created snapshots
1. Run `happo upload` to upload diffs to a publicly accessible location

There's an example script implementing these steps located in
[happo_example.sh](happo_example.sh). Use that as a starting point for your own
CI script.

### Headless Happo

Since Happo uses Firefox to generate its snapshots, you need a display. If
you are on a build server, you usually don't have a screen. To run `happo`
then, you can use a virtual display server such as
[xvfb](http://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml). The
[example CI script](happo_example.sh) as well as the internal Travis test
run for Happo uses `xvfb-run` in order to obtain a virtual display.

## In the wild

[Organizations and projects using Happo](INTHEWILD.md).
