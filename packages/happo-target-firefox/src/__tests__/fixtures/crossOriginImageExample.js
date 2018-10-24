happo.define('img', () => {
  const elem = document.createElement('div');
  elem.innerHTML = '<img src="https://placekitten.com/200/287" crossorigin="anonymous">';
  document.body.appendChild(elem);
}, { viewports: ['medium'] });
