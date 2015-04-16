likadan.define('foo', function() {
  var elem = document.createElement('div');
  elem.setAttribute('class', 'foo');
  elem.innerHTML = 'Texts insides';
  document.body.appendChild(elem);
  return elem;
});

likadan.define('hallooo', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'Hioi!<br>Hello';
  document.body.appendChild(elem);
  return elem;
}, [320, 1024]);

likadan.define('bar', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'go bars!<br>bars';
  document.body.appendChild(elem);
  return elem;
});
