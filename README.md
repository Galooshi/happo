# Likadan

Likadan is a command-line tool to visually diff JavaScript components.

You begin by defining a set of examples that Likadan will grab snapshots for.
If a previous snapshot (called a "baseline") exists for a component, Likadan
will diff the new snapshot with the old baseline. If a diff is found, a visual
representation of the changes will be constructed. You can then use that diff
image to decide whether a visual regression has been introduced or not, and
take appropriate action based on that information.

![Demo of Likadan in action](likadan_demo.gif)

## Defining examples

You define your examples in a JavaScript file and include it in the
`source_files` [configuration](#configuration) option.

Here's an example of a button component being added to a Likadan suite:

```javascript
likadan.define('button', function() {
  var elem = document.createElement('button');
  elem.setAttribute('class', '.button');
  elem.innerHTML = 'Submit';
  document.body.appendChild(elem);
  return elem;
});
```

Examples are responsible themselves for rendering the element into the DOM.
This is because a lot of frameworks (e.g.
[React](https://facebook.github.io/react/)) like to stay in control over the
DOM. A helper method to reduce some of the boilerplate is probably a good idea
in your project.

During development, you might want to zoom in/focus on a single example. In
those situations, you can use the `likadan.fdefine` function instead of
`likadan.define`. Using `fdefine` will cause `likadan` to only run for that
example.

### Setting viewport sizes

By default, Likadan renders examples in a 1024 wide window. If you have
components that render differently depending on available screen size you can
use the `viewports` option in the object passed in as the second argument to
`likadan.define`. These need to correspond to configured `viewports` in the
`.likadan.yaml` file. Likadan comes pre-configured with three default sizes:
`large` (1024x768), `medium` (640x888), and `small` (320x444).

```javascript
likadan.define('responsive component', function() {
  var elem = document.createElement('div');
  elem.setAttribute('class', '.responsive-component');
  document.body.appendChild(elem);
  return elem;
}, { viewports: ['large', 'small'] });
```

### Controlling the snapshot

Likadan can usually figure out what part of the screen belongs to your
component, and take the snapshot of that area. In some situations however, that
won't work. In those cases, you can pass in the `snapshotEntireScreen` option
to force a full-size snapshot to be taken.

```javascript
likadan.define('dialog window', function() {
  var elem = document.createElement('div');
  elem.setAttribute('class', '.dialog');
  document.body.appendChild(elem);
  return elem;
}, { snapshotEntireScreen: true });
```

### Async examples

If your examples need to do something asynchronous before they finish render,
you can use the `done` callback passed in to the define method.

```javascript
likadan.define('async component', function(done) {
  var elem = document.createElement('div');
  document.body.appendChild(elem);
  setTimeout(function() {
    elem.innerHTML = 'Async content loaded';
    done(elem);
  }, 100)
});
```

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
viewports:
  large:
    width: 1024
    height: 768
  small:
    width: 320
    height: 444
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

### `likadan clean`

Recursively removes everything in the snapshots folder (configured through
`snapshots_folder`).

## Running in a CI environment

The main purpose for Likadan is for it to be run in a CI (Continuous
Integration) environment. The command line tools provided are designed to be
used as building blocks in a script that you can run in
[Travis](https://travis-ci.org/), [Jenkins](https://jenkins-ci.org/) and other
Continuous Integration environments.

Below is an example of how you can use Likadan to test if a commit introduces
any visual change.

1. Check out the commit previous to the one to test (e.g. `git checkout HEAD^`)
2. (optionally) precompile your JavaScript and/or CSS
3. Run `likadan` to generate baseline snapshots
4. Check out the commit to test
5. (optionally) precompile your JavaScript and/or CSS
6. Run `likadan` to diff against previously created snapshots
7. Run `likadan upload_diffs` to upload diffs to a publicly accessible location

There's an example script implementing these steps located in
[likadan_ci_example.sh](likadan_ci_example.sh). Use that as a starting point
for your own CI script.

### Headless Likadan

Since Likadan uses Firefox to generate its snapshots, you need a display.  If
you are on a build server, you usually don't have a screen. To run `likadan`
then, you can use a virtual display server such as
[xvfb](http://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml).  The
[example CI script](likadan_ci_example.sh) as well as the internal Travis test
run for Likadan uses `xvfb-run` in order to obtain a virtual display. There are
other tools that can help you with this as well, for example the [headless
gem](https://github.com/leonid-shevtsov/headless).
