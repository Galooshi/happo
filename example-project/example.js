likadan.define('foo', function() {
  var elem = document.createElement('div');
  elem.setAttribute('class', 'foo');
  elem.innerHTML = 'Text inside';
  return elem;
});

likadan.define('hallooo', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'Hioi!<br>Hello';
  return elem;
});

likadan.define('bar', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'bars!<br>bars';
  return elem;
});
