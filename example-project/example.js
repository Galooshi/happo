likadan.define('foo', function(out) {
  var elem = document.createElement('div');
  elem.setAttribute('class', 'foo');
  elem.innerHTML = 'Text inside';
  out.appendChild(elem);
});

likadan.define('hallooo', function(out) {
  var elem = document.createElement('span');
  elem.innerHTML = 'Hioi!<br>Hello';
  out.appendChild(elem);
}, [320, 1024]);

likadan.define('bar', function(out) {
  var elem = document.createElement('span');
  elem.innerHTML = 'go bars!<br>bars';
  out.appendChild(elem);
});
