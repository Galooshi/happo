window.likadan = {
  defined: [],
  currentIndex: 0,
  currentExample: undefined,
  currentRenderedElement: undefined,
  errors: [],

  define: function(name, func, options) {
    this.defined.push({
      name: name,
      func: func,
      options: options || {}
    });
  },

  fdefine: function() {
    this.defined = []; // clear out all previously added examples
    this.define.apply(this, arguments); // add the example
    this.define = function() {}; // make `define` a no-op from now on
  },

  next: function() {
    if (this.currentRenderedElement) {
      if (window.React) {
        window.React.unmountComponentAtNode(document.body.lastChild);
      } else {
        this.currentRenderedElement.parentNode.removeChild(this.currentRenderedElement);
      }
    }
    this.currentExample = this.defined[this.currentIndex];
    if (!this.currentExample) {
      return;
    }
    this.currentIndex++;
    return this.currentExample;
  },

  setCurrent: function(exampleName) {
    this.defined.forEach(function(example, index) {
      if (example.name === exampleName) {
        this.currentExample = example;
      }
    }.bind(this));
    if (!this.currentExample) {
      throw 'No example found with name "' + exampleName + '"';
    }
  },

  clearVisibleElements: function() {
    var allElements = Array.prototype.slice.call(document.querySelectorAll('body > *'));
    allElements.forEach(function(element) {
      var style = window.getComputedStyle(element);
      if (style.display !== 'none') {
        element.parentNode.removeChild(element);
      }
    });
  },

  handleError: function(error) {
    console.error(error);
    return {
      name: this.currentExample.name,
      error: error.message
    };
  },

  /**
   * @param {Function} func The likadan.describe function from the current
   *   example being rendered. This function takes a callback as an argument
   *   that is called when it is done.
   * @return {Promise}
   */
  tryAsync: function(func) {
    return new Promise(function(resolve, reject) {
      // Saftey valve: if the function does not finish after 3s, then something
      // went haywire and we need to move on.
      var timeout = setTimeout(function() {
        reject(new Error('Async callback was not invoked within timeout.'));
      }, 3000);

      // This function is called by the example when it is done executing.
      var doneCallback = function(elem) {
        clearTimeout(timeout);

        if (!arguments.length) {
          return reject(new Error(
            'The async done callback expects the rendered element as an ' +
            'argument, but there were no arguments.'
          ));
        }

        resolve(elem);
      };

      func(doneCallback);
    });
  },

  /**
   * @param {Function} doneFunc injected by driver.execute_async_script in
   *   likadan_runner.rb
   */
  renderCurrent: function(doneFunc) {
    try {
      this.clearVisibleElements();

      var func = this.currentExample.func;
      if (func.length) {
        // The function takes an argument, which is a callback that is called
        // once it is done executing. This can be used to write functions that
        // have asynchronous code in them.
        this.tryAsync(func).then(function(elem) {
          doneFunc(this.processElem(elem));
        }.bind(this)).catch(function(error) {
          doneFunc(this.handleError(error));
        }.bind(this));
      } else {
        // The function does not take an argument, so we can run it
        // synchronously.
        var elem = func();
        doneFunc(this.processElem(elem));
      }
    } catch (error) {
      doneFunc(this.handleError(error));
    }
  },

  processElem: function(elem) {
    try {
      // TODO: elem.getDOMNode is deprecated in React, so we need to convert
      // this to React.findDOMNode(elem) at some point, or push this requirement
      // into the examples.
      if (elem.getDOMNode) {
        // Soft-dependency to React here. If the thing returned has a
        // `getDOMNode` method, call it to get the real DOM node.
        elem = elem.getDOMNode();
      }

      this.currentRenderedElement = elem;

      var width = elem.offsetWidth;
      var height = elem.offsetHeight;
      var top = elem.offsetTop;
      var left = elem.offsetLeft;

      if (this.currentExample.options.snapshotEntireScreen) {
        width = window.innerWidth;
        height = window.innerHeight;
        top = 0;
        left = 0;
      }
      return {
        name: this.currentExample.name,
        width: width,
        height: height,
        top: top,
        left: left
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
};

window.addEventListener('load', function() {
  var matches = window.location.search.match(/name=([^&]*)/);
  if (!matches) {
    return;
  }
  var example = decodeURIComponent(matches[1]);
  window.likadan.setCurrent(example);
  window.likadan.renderCurrent();
});

// We need to redefine a few global functions that halt execution. Without this,
// there's a chance that the Ruby code can't communicate with the browser.
window.alert = function(message) {
  console.log('`window.alert` called', message);
};
window.confirm = function(message) {
  console.log('`window.confirm` called', message);
  return true;
};
window.prompt = function(message, value) {
  console.log('`window.prompt` called', message, value);
  return null;
};

window.onerror = function(message, url, lineNumber) {
  window.likadan.errors.push({ message: message, url: url, lineNumber: lineNumber });
}
