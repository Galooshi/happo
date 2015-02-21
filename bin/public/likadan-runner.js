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
    var elem = next.func();
    out.appendChild(elem);

    return {
      name: next.name,
      width: elem.offsetWidth,
      height: elem.offsetHeight
    };
  }
};
