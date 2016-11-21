happo.define('button', () => {
  const elem = document.createElement('button');
  elem.innerHTML = 'Click me';
  document.body.appendChild(elem);
}, { viewports: ['large', 'medium'] });

happo.define('random', () => {
  const elem = document.createElement('span');
  const rand = Math.random();
  elem.innerHTML = `Random number: ${rand}`;
  document.body.appendChild(elem);
});
