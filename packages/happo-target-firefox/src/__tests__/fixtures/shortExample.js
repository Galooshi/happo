happo.define('foo', () => {
  const elem = document.createElement('div');
  elem.style.height = '20px';
  elem.style.width = '10px';
  document.body.appendChild(elem);
}, { viewports: ['small'] });
