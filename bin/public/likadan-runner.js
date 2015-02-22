window.likadan = {
  defined: [],

  define: function(name, func) {
    this.defined.push({
      name: name,
      func: func
    });
  },

  next: function() {
    var next = this.defined.shift();
    if (!next) {
      return;
    }
    var out = document.getElementById('likadan-output');
    out.innerHTML = '';
    next.func(out);

    var elem = out.firstChild;

    return {
      name: next.name,
      width: elem.offsetWidth,
      height: elem.offsetHeight
    };
  }
};
