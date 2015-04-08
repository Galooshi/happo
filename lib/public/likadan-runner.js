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

  renderCurrent: function() {
    var out = document.getElementById('likadan-output');
    out.innerHTML = '';
    this.currentExample.func(out);

    var elem = out.firstChild;

    return {
      name: this.currentExample.name,
      width: elem.offsetWidth,
      height: elem.offsetHeight
    };
  }
};
