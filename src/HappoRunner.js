import getFullRect from './getFullRect';
import waitForImagesToRender from './waitForImagesToRender';

function handleError(currentExample, error) {
  console.error(error.stack); // eslint-disable-line no-console
  return {
    description: currentExample.description,
    error: error.message,
  };
}

/**
 * @param {Function} func The happo.describe function from the current
 *   example being rendered. This function takes a callback as an argument
 *   that is called when it is done.
 * @return {Promise}
 */
function tryAsync(func) {
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
}

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

  /**
   * Clean up the DOM for a rendered element that has already been processed.
   * This can be overridden by consumers to define their own clean out method,
   * which can allow for this to be used to unmount React components, for
   * example.
   */
  cleanOutElement() {
  },

  /**
   * This function is called asynchronously. Therefore, we need to call doneFunc
   * when the method has completed so that Happo knows to continue.
   *
   * @param {String} exampleDescription
   * @param {Function} doneFunc injected by driver.execute_async_script in
   *   happo/runner.rb
   */
  renderExample(exampleDescription, doneFunc) {
    console.log(exampleDescription);
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
        tryAsync(func).then(() => {
          this.processExample(currentExample).then(doneFunc).catch(doneFunc);
        }).catch((error) => {
          doneFunc(handleError(currentExample, error));
        });
      } else {
        // The function does not take an argument, so we can run it
        // synchronously.
        const result = func();

        if (result instanceof Promise) {
          // The function returned a promise, so we need to wait for it to
          // resolve before proceeding.
          result.then(() => {
            this.processExample(currentExample).then(doneFunc).catch(doneFunc);
          }).catch((error) => {
            doneFunc(handleError(currentExample, error));
          });
        } else {
          // The function did not return a promise, so we assume it gave us an
          // element that we can process immediately.
          this.processExample(currentExample).then(doneFunc).catch(doneFunc);
        }
      }
    } catch (error) {
      doneFunc(handleError(currentExample, error));
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

  /**
   * @return {Promise}
   */
  processExample(currentExample) {
    return new Promise((resolve, reject) => {
      waitForImagesToRender().then(() => {
        try {
          const rootNodes = this.getRootNodes();
          const {
            height,
            left,
            top,
            width,
          } = getFullRect(rootNodes);

          resolve({
            description: currentExample.description,
            height,
            left,
            top,
            width,
          });
        } catch (error) {
          reject(handleError(currentExample, error));
        }
      }).catch((error) => {
        reject(handleError(currentExample, error));
      });
    });
  },
};

window.addEventListener('load', () => {
  const matches = window.location.search.match(/description=([^&]*)/);
  if (!matches) {
    return;
  }
  const example = decodeURIComponent(matches[1]);
  window.happo.renderExample(example, () => {});
  document.title = `${example} · Happo`;
});

// We need to redefine a few global functions that halt execution. Without this,
// there's a chance that the we can't communicate with the browser.
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
