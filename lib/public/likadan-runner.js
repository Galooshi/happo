window.likadan = {
  defined: [],
  currentIndex: 0,
  currentExample: undefined,

  define: function(name, func, viewportWidths) {
    this.defined.push({
      name: name,
      func: func,
      viewportWidths: viewportWidths || [1024]
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

    return {
      name: this.currentExample.name,
      width: elem.offsetWidth,
      height: elem.offsetHeight
    };
  }
};
