# Happo Target: Firefox

## Installation

If you haven't already installed `happo` you will need to do that:
```bash
npm install --save-dev happo
```

To get the Firefox target, you will install from npm:

```bash
npm install --save-dev happo-target-firefox
```

You'll also need Firefox installed on the machine. Happo uses
[selenium-webdriver](https://github.com/SeleniumHQ/selenium) under the hood,
and will support the same version of Firefox as Selenium supports. Happo
currently works best with _Firefox > 50_. It uses
[geckodriver](https://github.com/mozilla/geckodriver) to control Firefox.


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

### Example configuration

```js
// .happo.js
// =========

var FirefoxTarget = require('happo-target-firefox');

module.exports = {
  // ... 

  targets: [
    // ...
    new FirefoxTarget({
      // an overridable name to identify the target 
      // (useful for running a specific target from the CLI.)
      // (default: 'firefox')
      name: 'firefox',

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
    }),
  ],
};
```


### Headless Happo

Since Happo uses Firefox to generate its snapshots, you need a display. If
you are on a build server, you usually don't have a screen. To run `happo`
then, you can use a virtual display server such as
[xvfb](http://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml). The
[example CI script](happo_example.sh) as well as the internal Travis test
run for Happo uses `xvfb-run` in order to obtain a virtual display.
