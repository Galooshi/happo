happo.define('regular img with crossOrigin', () => {
  const elem = document.createElement('div');
  elem.innerHTML = '<img src="https://placekitten.com/200/287" crossorigin="anonymous">';
  document.body.appendChild(elem);
}, { viewports: ['medium'] });

happo.define('srcset img with crossOrigin', () => {
  const elem = document.createElement('div');
  elem.innerHTML = '<img srcset="https://picsum.photos/50/50 300w, https://picsum.photos/200/200 500w" crossorigin="anonymous">';
  document.body.appendChild(elem);
}, { viewports: ['medium'] });

happo.define('background-image', () => {
  const elem = document.createElement('div');
  elem.style = 'background-image: url(https://picsum.photos/500/500); height: 200px; width: 200px;';
  document.body.appendChild(elem);
}, { viewports: ['medium'] });
