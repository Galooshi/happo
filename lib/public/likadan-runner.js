window.likadan = {
  defined: [],
  current: 0,

  define: function(name, func) {
    this.defined.push({
      name: name,
      func: func
    });
  },

  next: function() {
    var next = this.defined[this.current];
    if (!next) {
      return;
    }
    this.current++;
    var out = document.getElementById('likadan-output');
    out.innerHTML = '';
    next.func(out);

    var elem = out.firstChild;

    return {
      name: next.name,
      width: elem.offsetWidth,
      height: elem.offsetHeight
    };
  },

  reset: function() {
    this.current = 0;
  }
};
