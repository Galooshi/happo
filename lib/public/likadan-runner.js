window.likadan = {
  defined: [],
  currentIndex: 0,
  currentExample: undefined,

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

  getOutputElement: function() {
    return document.getElementById('likadan-output');
  },

  clearVisibleElements: function() {
    var out = this.getOutputElement();
    var allElements = Array.prototype.slice.call(document.querySelectorAll('body > *'));
    allElements.forEach(function(element) {
      if (element === out) {
        return;
      }
      var style = window.getComputedStyle(element);
      if (style.display !== 'none') {
        element.parentNode.removeChild(element);
      }
    });
  },

  renderCurrent: function() {
    try {
      var out = this.getOutputElement();
      out.innerHTML = '';

      // We need to clear out anything currently visible. There's no guarantee
      // that examples only render inside the .likadan-output container.
      this.clearVisibleElements();

      var elem = this.currentExample.func();
      if (elem.getDOMNode) {
        // Soft-dependency to React here. If the thing returned has a
        // `getDOMNode` method, call it to get the real DOM node.
        elem = elem.getDOMNode();
      }
      out.appendChild(elem);

      var width = elem.offsetWidth;
      var height = elem.offsetHeight;

      if (this.currentExample.options.snapshotEntireScreen) {
        width = window.innerWidth;
        height = window.innerHeight;
      }
      return {
        name: this.currentExample.name,
        width: width,
        height: height
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
