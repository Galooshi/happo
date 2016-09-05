/* eslint strict: 0 */
/* eslint object-shorthand: 0 */
/* eslint prefer-template: 0 */
/* eslint comma-dangle: 0 */
/* eslint no-var: 0 */
/* eslint prefer-arrow-callback: 0 */
/* eslint vars-on-top: 1 */
'use strict';

window.happo = {
  defined: {},
  fdefined: [],
  errors: [],

  define: function define(description, func, options) {
    // Make sure we don't have a duplicate description
    if (this.defined[description]) {
      throw new Error('Error while defining "' + description +
        '": Duplicate description detected');
    }
    this.defined[description] = {
      description: description,
      func: func,
      options: options || {}
    };
  },

  fdefine: function fdefine(description, func, options) {
    this.define(description, func, options); // add the example
    this.fdefined.push(description);
  },

  /**
   * @return {Array.<Object>}
   */
  getAllExamples: function getAllExamples() {
    var descriptions = this.fdefined.length ?
      this.fdefined :
      Object.keys(this.defined);

    return descriptions.map(function processDescription(description) {
      var example = this.defined[description];
      // We return a subset of the properties of an example (only those relevant
      // for happo_runner.rb).
      return {
        description: example.description,
        options: example.options,
      };
    }.bind(this));
  },

  handleError: function handleError(currentExample, error) {
    console.error(error.stack);
    return {
      description: currentExample.description,
      error: error.message
    };
  },

  /**
   * @param {Function} func The happo.describe function from the current
   *   example being rendered. This function takes a callback as an argument
   *   that is called when it is done.
   * @return {Promise}
   */
  tryAsync: function tryAsync(func) {
    return new Promise(function tryAsyncPromise(resolve, reject) {
      // Safety valve: if the function does not finish after 3s, then something
      // went haywire and we need to move on.
      var timeout = setTimeout(function tryAsyncTimeout() {
        reject(new Error('Async callback was not invoked within timeout.'));
      }, 3000);

      // This function is called by the example when it is done executing.
      var doneCallback = function doneCallback(elem) {
        clearTimeout(timeout);

        if (!arguments.length) {
          reject(new Error(
            'The async done callback expects the rendered element as an ' +
            'argument, but there were no arguments.'
          ));
          return;
        }

        resolve(elem);
      };

      func(doneCallback);
    });
  },

  /**
   * Clean up the DOM for a rendered element that has already been processed.
   * This can be overridden by consumers to define their own clean out method,
   * which can allow for this to be used to unmount React components, for
   * example.
   *
   * @param {Object} renderedElement
   */
  cleanOutElement: function cleanOutElement() {
  },

  /**
   * This function is called from Ruby asynchronously. Therefore, we need to
   * call doneFunc when the method has completed so that Ruby knows to continue.
   *
   * @param {String} exampleDescription
   * @param {Function} doneFunc injected by driver.execute_async_script in
   *   happo/runner.rb
   */
  renderExample: function renderExample(exampleDescription, doneFunc) {
    var currentExample = this.defined[exampleDescription];

    try {
      if (!currentExample) {
        throw new Error(
          'No example found with description "' + exampleDescription + '"');
      }

      // Clear out the body of the document
      while (document.body.firstChild) {
        if (document.body.firstChild instanceof Element) {
          this.cleanOutElement(document.body.firstChild);
        }
        document.body.removeChild(document.body.firstChild);
      }

      var func = currentExample.func;
      if (func.length) {
        // The function takes an argument, which is a callback that is called
        // once it is done executing. This can be used to write functions that
        // have asynchronous code in them.
        this.tryAsync(func).then(function () {
          doneFunc(this.processExample(currentExample));
        }.bind(this)).catch(function (error) {
          doneFunc(this.handleError(currentExample, error));
        }.bind(this));
      } else {
        // The function does not take an argument, so we can run it
        // synchronously.
        var result = func();

        if (result instanceof Promise) {
          // The function returned a promise, so we need to wait for it to
          // resolve before proceeding.
          result.then(function () {
            doneFunc(this.processExample(currentExample));
          }.bind(this)).catch(function (error) {
            doneFunc(this.handleError(currentExample, error));
          }.bind(this));
        } else {
          // The function did not return a promise, so we assume it gave us an
          // element that we can process immediately.
          doneFunc(this.processExample(currentExample));
        }
      }
    } catch (error) {
      doneFunc(this.handleError(currentExample, error));
    }
  },

  // Scrollbars inside of elements may cause spurious visual diffs. To avoid
  // this issue, we can hide them automatically by styling the overflow to be
  // hidden.
  removeScrollbars: function removeScrollbars(node) {
    if (
      node.scrollHeight !== node.clientHeight
      || node.scrollWidth !== node.clientWidth
    ) {
      // We style this via node.style.cssText so that we can override any styles
      // that might already be `!important`.
      // eslint-disable-next-line no-param-reassign
      node.style.cssText += 'overflow: hidden !important';
    }
  },

  // This function takes a node and a box object that we will mutate.
  getFullRectRecursive: function getFullRectRecursive(node, box) {
    // Since we are already traversing through every node, let's piggyback on
    // that work and remove scrollbars to prevent spurious diffs.
    this.removeScrollbars(node);

    var rect = node.getBoundingClientRect();

    /* eslint-disable no-param-reassign */
    box.bottom = Math.max(box.bottom, rect.bottom);
    box.left = Math.min(box.left, rect.left);
    box.right = Math.max(box.right, rect.right);
    box.top = Math.min(box.top, rect.top);
    /* eslint-enable no-param-reassign */

    for (var i = 0; i < node.children.length; i++) {
      this.getFullRectRecursive(node.children[i], box);
    }
  },

  // This function gets the full size of children in the document body,
  // including all descendent nodes. This allows us to ensure that the
  // screenshot includes absolutely positioned elements. It is important that
  // this is fast, since we may be iterating over a high number of nodes.
  getFullRect: function getFullRect() {
    // Set up the initial object that we will mutate in our recursive function.
    var box = {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    };

    // If there are any children, we want to iterate over them recursively,
    // mutating our box object along the way to expand to include all descendent
    // nodes.
    for (var i = 0; i < document.body.children.length; i++) {
      var node = document.body.children[i];

      this.getFullRectRecursive(node, box);

      // getBoundingClientRect does not include margin, so we need to use
      // getComputedStyle. Since this is slow and the margin of descendent
      // elements is significantly less likely to matter, let's include the
      // margin only from the topmost nodes.
      var computedStyle = window.getComputedStyle(node);
      box.bottom += parseInt(computedStyle.getPropertyValue('margin-bottom'), 10);
      box.left -= parseInt(computedStyle.getPropertyValue('margin-left'), 10);
      box.right += parseInt(computedStyle.getPropertyValue('margin-right'), 10);
      box.top -= parseInt(computedStyle.getPropertyValue('margin-top'), 10);
    }

    // As the last step, we calculate the width and height for the box. This is
    // to avoid having to do them for every node. Before we do that however, we
    // cut off things that render off the screen to the top or left, since those
    // won't be in the screenshot file that we then crop from. If you're
    // wondering why right and bottom isn't "fixed" here too, it's because we
    // don't have to since the screenshot already includes overflowing content
    // on the bottom and right.
    box.left = Math.max(box.left, 0);
    box.top = Math.max(box.top, 0);

    box.width = box.right - box.left;
    box.height = box.bottom - box.top;

    return box;
  },

  processExample: function processExample(currentExample) {
    try {
      // Note that this method returns floats, so we need to round those off
      // to integers before returning.
      var rect = this.getFullRect();

      return {
        description: currentExample.description,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        top: Math.floor(rect.top),
        left: Math.floor(rect.left),
      };
    } catch (error) {
      return this.handleError(currentExample, error);
    }
  }
};

window.addEventListener('load', function handleWindowLoad() {
  var matches = window.location.search.match(/description=([^&]*)/);
  if (!matches) {
    return;
  }
  var example = decodeURIComponent(matches[1]);
  window.happo.renderExample(example, function () {});
});

// We need to redefine a few global functions that halt execution. Without this,
// there's a chance that the Ruby code can't communicate with the browser.
window.alert = function alert(message) {
  console.log('`window.alert` called', message);
};

window.confirm = function confirm(message) {
  console.log('`window.confirm` called', message);
  return true;
};

window.prompt = function prompt(message, value) {
  console.log('`window.prompt` called', message, value);
  return null;
};

window.onerror = function onerror(message, url, lineNumber) {
  window.happo.errors.push({
    message: message,
    url: url,
    lineNumber: lineNumber
  });
};
