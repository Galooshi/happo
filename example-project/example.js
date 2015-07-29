likadan.define('foo', function() {
  var elem = document.createElement('div');
  elem.setAttribute('class', 'foo');
  elem.innerHTML = 'Texts insides';
  document.body.appendChild(elem);
  return elem;
});

likadan.define('hallooo', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'Hioyi!<br>Hello';
  document.body.appendChild(elem);
  return elem;
}, { viewports: ['mobile', 'desktop'] });

likadan.define('bar', function() {
  var elem = document.createElement('span');
  elem.innerHTML = 'go bars!<br>bars';
  document.body.appendChild(elem);
  return elem;
}, { snapshotEntireScreen: true });
