window.happo = {
  defined: {},
  fdefined: [],
  errors: [],

  define(description, func, options) {
    // Make sure we don't have a duplicate description
    if (this.defined[description]) {
      throw new Error(
        `Error while defining "${description}": Duplicate description detected`);
    }
    this.defined[description] = {
      description,
      func,
      options: options || {},
    };
  },

  fdefine(description, func, options) {
    this.define(description, func, options); // add the example
    this.fdefined.push(description);
  },

  /**
   * @return {Array.<Object>}
   */
  getAllExamples() {
    const descriptions = this.fdefined.length ?
      this.fdefined :
      Object.keys(this.defined);

    return descriptions.map((description) => {
      const example = this.defined[description];
      // We return a subset of the properties of an example (only those relevant
      // for happo_runner.rb).
      return {
        description: example.description,
        options: example.options,
      };
    });
  },

  handleError(currentExample, error) {
    console.error(error.stack); // eslint-disable-line no-console
    return {
      description: currentExample.description,
      error: error.message,
    };
  },

  /**
   * @param {Function} func The happo.describe function from the current
   *   example being rendered. This function takes a callback as an argument
   *   that is called when it is done.
   * @return {Promise}
   */
  tryAsync(func) {
    return new Promise((resolve, reject) => {
      // Safety valve: if the function does not finish after 3s, then something
      // went haywire and we need to move on.
      const timeout = setTimeout(() => {
        reject(new Error('Async callback was not invoked within timeout.'));
      }, 3000);

      // This function is called by the example when it is done executing.
      const doneCallback = () => {
        clearTimeout(timeout);
        resolve();
      };

      func(doneCallback);
    });
  },

  /**
   * Clean up the DOM for a rendered element that has already been processed.
   * This can be overridden by consumers to define their own clean out method,
   * which can allow for this to be used to unmount React components, for
   * example.
   */
  cleanOutElement() {
  },

  /**
   * This function is called from Ruby asynchronously. Therefore, we need to
   * call doneFunc when the method has completed so that Ruby knows to continue.
   *
   * @param {String} exampleDescription
   * @param {Function} doneFunc injected by driver.execute_async_script in
   *   happo/runner.rb
   */
  renderExample(exampleDescription, doneFunc) {
    const currentExample = this.defined[exampleDescription];

    try {
      if (!currentExample) {
        throw new Error(
          `No example found with description "${exampleDescription}"`);
      }

      // Clear out the body of the document
      while (document.body.firstChild) {
        if (document.body.firstChild instanceof Element) {
          this.cleanOutElement(document.body.firstChild);
        }
        document.body.removeChild(document.body.firstChild);
      }

      const { func } = currentExample;
      if (func.length) {
        // The function takes an argument, which is a callback that is called
        // once it is done executing. This can be used to write functions that
        // have asynchronous code in them.
        this.tryAsync(func).then(() => {
          doneFunc(this.processExample(currentExample));
        }).catch((error) => {
          doneFunc(this.handleError(currentExample, error));
        });
      } else {
        // The function does not take an argument, so we can run it
        // synchronously.
        const result = func();

        if (result instanceof Promise) {
          // The function returned a promise, so we need to wait for it to
          // resolve before proceeding.
          result.then(() => {
            doneFunc(this.processExample(currentExample));
          }).catch((error) => {
            doneFunc(this.handleError(currentExample, error));
          });
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

  isAutoOrScroll(overflow) {
    return overflow === 'auto' || overflow === 'scroll';
  },

  // Scrollbars inside of elements may cause spurious visual diffs. To avoid
  // this issue, we can hide them automatically by styling the overflow to be
  // hidden.
  removeScrollbars(node) {
    const isOverflowing =
      node.scrollHeight !== node.clientHeight
      || node.scrollWidth !== node.clientWidth;

    if (!isOverflowing) {
      // This node has no overflowing content. We're returning early to prevent
      // calling getComputedStyle down below (which is an expensive operation).
      return;
    }

    const style = window.getComputedStyle(node);
    if (
      this.isAutoOrScroll(style.getPropertyValue('overflow-y'))
      || this.isAutoOrScroll(style.getPropertyValue('overflow-x'))
      || this.isAutoOrScroll(style.getPropertyValue('overflow'))
    ) {
      // We style this via node.style.cssText so that we can override any styles
      // that might already be `!important`.
      // eslint-disable-next-line no-param-reassign
      node.style.cssText += 'overflow: hidden !important';
    }
  },

  /**
   * Wrapper around Math.min to handle undefined values.
   */
  min(a, b) {
    if (a === undefined) {
      return b;
    }
    return Math.min(a, b);
  },

  // This function takes a node and a box object that we will mutate.
  getFullRectRecursive(node, box) {
    // Since we are already traversing through every node, let's piggyback on
    // that work and remove scrollbars to prevent spurious diffs.
    this.removeScrollbars(node);

    const rect = node.getBoundingClientRect();

    /* eslint-disable no-param-reassign */
    box.bottom = Math.max(box.bottom, rect.bottom);
    box.left = this.min(box.left, rect.left);
    box.right = Math.max(box.right, rect.right);
    box.top = this.min(box.top, rect.top);
    /* eslint-enable no-param-reassign */

    for (let i = 0; i < node.children.length; i++) {
      this.getFullRectRecursive(node.children[i], box);
    }
  },

  /**
   * Gets the DOM elements that we will use as source for the snapshot. The
   * default version simply gets the direct children of document.body, but you
   * can override this method to better control the root nodes.
   *
   * @return {Array|NodeList}
   */
  getRootNodes() {
    return document.body.children;
  },

  // This function gets the full size of children in the document body,
  // including all descendent nodes. This allows us to ensure that the
  // screenshot includes absolutely positioned elements. It is important that
  // this is fast, since we may be iterating over a high number of nodes.
  getFullRect() {
    // Set up the initial object that we will mutate in our recursive function.
    const box = {
      bottom: 0,
      left: undefined,
      right: 0,
      top: undefined,
    };

    const rootNodes = this.getRootNodes();

    // If there are any children, we want to iterate over them recursively,
    // mutating our box object along the way to expand to include all descendent
    // nodes.
    // Remember! rootNodes can be either an Array or a NodeList.
    for (let i = 0; i < rootNodes.length; i++) {
      const node = rootNodes[i];

      this.getFullRectRecursive(node, box);

      // getBoundingClientRect does not include margin, so we need to use
      // getComputedStyle. Since this is slow and the margin of descendent
      // elements is significantly less likely to matter, let's include the
      // margin only from the topmost nodes.
      const computedStyle = window.getComputedStyle(node);
      box.bottom += parseFloat(computedStyle.getPropertyValue('margin-bottom'));
      box.left -= parseFloat(computedStyle.getPropertyValue('margin-left'));
      box.right += parseFloat(computedStyle.getPropertyValue('margin-right'));
      box.top -= parseFloat(computedStyle.getPropertyValue('margin-top'));
    }

    // Since getBoundingClientRect() and margins can contain subpixel values, we
    // want to round everything before calculating the width and height to
    // ensure that we will take a screenshot of the entire component.
    box.bottom = Math.ceil(box.bottom);
    box.left = Math.floor(box.left);
    box.right = Math.ceil(box.right);
    box.top = Math.floor(box.top);

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

  processExample(currentExample) {
    try {
      const {
        height,
        left,
        top,
        width,
      } = this.getFullRect();

      return {
        description: currentExample.description,
        height,
        left,
        top,
        width,
      };
    } catch (error) {
      return this.handleError(currentExample, error);
    }
  },
};

window.addEventListener('load', () => {
  const matches = window.location.search.match(/description=([^&]*)/);
  if (!matches) {
    return;
  }
  const example = decodeURIComponent(matches[1]);
  window.happo.renderExample(example, () => {});
});

// We need to redefine a few global functions that halt execution. Without this,
// there's a chance that the Ruby code can't communicate with the browser.
window.alert = (message) => {
  console.log('`window.alert` called', message); // eslint-disable-line
};

window.confirm = (message) => {
  console.log('`window.confirm` called', message); // eslint-disable-line
  return true;
};

window.prompt = (message, value) => {
  console.log('`window.prompt` called', message, value); // eslint-disable-line
  return null;
};

window.onerror = (message, url, lineNumber) => {
  window.happo.errors.push({
    message,
    url,
    lineNumber,
  });
};
