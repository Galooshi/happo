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
  document.body.innerHTML = '';
  document.body.appendChild(next.func());
  return {
    name: next.name
  };
};

define('tjena', function() {
  var elem = document.createElement('div');
  elem.innerHTML = 'tjena';
  return elem;
});

define('hallooo', function() {
  var elem = document.createElement('div');
  elem.innerHTML = 'Hii!';
  return elem;
});
