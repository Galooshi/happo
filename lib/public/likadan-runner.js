window.likadan = {
  defined: [],
  currentIndex: 0,
  currentExample: undefined,
  currentRenderedElement: undefined,

  define: function(name, func, viewportWidths, options) {
    this.defined.push({
      name: name,
      func: func,
      viewportWidths: viewportWidths || [1024],
      options: options || {
        snapshotEntireScreen: false
      }
    });
  },

  next: function() {
    if (this.currentRenderedElement) {
      if (React) {
        React.unmountComponentAtNode(document.body.lastChild);
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

  renderCurrent: function() {
    try {
      this.clearVisibleElements();
      var elem = this.currentExample.func();
      if (elem.getDOMNode) {
        // Soft-dependency to React here. If the thing returned has a
        // `getDOMNode` method, call it to get the real DOM node.
        elem = elem.getDOMNode();
      }

      this.currentRenderedElement = elem;

      var width = elem.offsetWidth;
      var height = elem.offsetHeight;

      if (this.currentExample.options.snapshotEntireScreen) {
        width = window.innerWidth;
        height = window.innerHeight;
      }
      return {
        name: this.currentExample.name,
        width: width,
        height: height,
      };
    } catch (error) {
      console.error(error);
      return {
        name: this.currentExample.name,
        error: error.message
      };
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
