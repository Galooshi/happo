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

### Setting viewports

By default, Likadan renders examples in a 1024 wide window. If you have
components that render differently depending on screen width you can pass in a
second argument to `likadan.define` listing the widths you want to take
snapshots for.

```javascript
likadan.define('responsive component', function() {
  var elem = document.createElement('div');
  elem.setAttribute('class', '.responsive-component');
  document.body.appendChild(elem);
  return elem;
}, [320, 1024]);
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
}, [320, 1024], { snapshotEntireScreen: true });
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
