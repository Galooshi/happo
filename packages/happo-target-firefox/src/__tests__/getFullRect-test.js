jest.mock('../removeScrollbars');

/* eslint-disable import/first */
import getFullRect from '../getFullRect';
import removeScrollbars from '../removeScrollbars';

function createElement({
  width = 0,
  height = 0,
  top = 0,
  left = 0,
  margin = 0,
  tag = 'div',
}) {
  const el = document.createElement(tag);
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.margin = `${margin}px`;

  const actualTop = top + margin;
  const actualLeft = left + margin;

  el.getBoundingClientRect = () => ({
    bottom: actualTop + height,
    right: actualLeft + width,
    top: actualTop,
    left: actualLeft,
  });

  return el;
}

afterEach(() => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  removeScrollbars.mockReset();
});

it('works on a 40x40 div', () => {
  const div = createElement({ width: 40, height: 40 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 40,
    bottom: 40,
    width: 40,
    height: 40,
  });
});

it('works with nested elements', () => {
  const div = createElement({ width: 40, height: 40 });
  const subDiv = createElement({ width: 50, height: 20 });
  div.appendChild(subDiv);
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 50,
    bottom: 40,
    width: 50,
    height: 40,
  });
});

it('includes margins', () => {
  const div = createElement({ width: 40, height: 40, margin: 5 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 50,
    bottom: 50,
    width: 50,
    height: 50,
  });
});

it('does not include margins of nested elements', () => {
  const div = createElement({ width: 40, height: 40 });
  const subDiv = createElement({ width: 35, height: 35, margin: 5 });
  div.appendChild(subDiv);
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 40,
    bottom: 40,
    width: 40,
    height: 40,
  });
});

it('rounds sub-pixel values', () => {
  const div = createElement({ width: 40.1, height: 40.9, margin: 5.1 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 51,
    bottom: 52,
    width: 51,
    height: 52,
  });
});

it('removes scrollbars on each node', () => {
  const div = createElement({ width: 40, height: 40 });
  const subDiv = createElement({ width: 50, height: 20 });
  div.appendChild(subDiv);
  document.body.appendChild(div);

  getFullRect(document.body.children);
  expect(removeScrollbars).toHaveBeenCalledTimes(2);
  expect(removeScrollbars).toHaveBeenCalledWith(div);
  expect(removeScrollbars).toHaveBeenCalledWith(subDiv);
});

it('prevents negative top and left values', () => {
  const div = createElement({ width: 40, height: 40, margin: -5 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 30,
    bottom: 30,
    width: 30,
    height: 30,
  });
});

it('works without any nodes', () => {
  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 1,
    bottom: 1,
    width: 1,
    height: 1,
  });
});

it('prevents 0x0', () => {
  const div = createElement({ width: 0, height: 0 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 1,
    bottom: 1,
    width: 1,
    height: 1,
  });
});

it('prevents 0x0 in the middle of the screen', () => {
  const div = createElement({ width: 0, height: 0, left: 10, top: 10 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 10,
    top: 10,
    right: 11,
    bottom: 11,
    width: 1,
    height: 1,
  });
});

it('prevents negative bottom and right values', () => {
  const div = createElement({ width: 40, height: 40, top: -50, left: -50 });
  document.body.appendChild(div);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 1,
    bottom: 1,
    width: 1,
    height: 1,
  });
});

it('works with multiple top-level elements', () => {
  const div1 = createElement({ width: 40, height: 40 });
  const div2 = createElement({ width: 40, height: 40, left: 40 });
  document.body.appendChild(div1);
  document.body.appendChild(div2);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 80,
    bottom: 40,
    width: 80,
    height: 40,
  });
});

it('includes the margin of all top-level elements', () => {
  const div1 = createElement({ width: 40, height: 40, margin: 5 });
  const div2 = createElement({ width: 40, height: 40, margin: 5, left: 50 });
  document.body.appendChild(div1);
  document.body.appendChild(div2);

  expect(getFullRect(document.body.children)).toEqual({
    left: 0,
    top: 0,
    right: 100,
    bottom: 50,
    width: 100,
    height: 50,
  });
});
