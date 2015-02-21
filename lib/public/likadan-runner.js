var defined = [];
var define = function(name, func) {
  defined.push({
    name: name,
    func: func
  });
};

var nextExample = function() {
  var next = defined.shift();
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
};

define('tjena', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'tjena!';
  return elem;
});

define('hallooo', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'Hioi!<br>Hello';
  return elem;
});
