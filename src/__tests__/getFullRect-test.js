import getFullRect from '../getFullRect';

function createElement({
  width = 0,
  height = 0,
  top = 0,
  left = 0,
  tag = 'div',
}) {
  const el = document.createElement(tag);
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  el.getBoundingClientRect = () => ({
    bottom: height + top,
    right: width + left,
    top,
    left,
  });

  return el;
}

it('works on a 40x40 div', () => {
  const div = createElement({ width: 40, height: 40 });
  document.body.appendChild(div);

  const divs = document.querySelectorAll('div');

  expect(getFullRect(divs)).toEqual({
    left: 0,
    top: 0,
    right: 40,
    bottom: 40,
    width: 40,
    height: 40,
  });
});
