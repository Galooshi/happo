happo.define('foo', () => {
  const elem = document.createElement('div');
  elem.innerHTML = `
    <img
      style="display: block"
      srcset="https://picsum.photos/50/50 300w, https://picsum.photos/200/200 500w"
    >
  `;
  document.body.appendChild(elem);
}, { viewports: ['small'] });
