const pageTitle = require('../pageTitle');

it('produces a reasonable title with no diffs or new images', () => {
  expect(pageTitle({ diffImages: [], newImages: [] })).toEqual('Happo');
});

it('produces the right title with one diff, no new images', () => {
  expect(pageTitle({ diffImages: [{}], newImages: [] })).toEqual('1 diff · Happo');
});

it('produces the right title with multiple diffs, no new images', () => {
  expect(pageTitle({ diffImages: [{}, {}, {}], newImages: [] }))
    .toEqual('3 diffs · Happo');
});

it('produces the right title with multiple diffs, one new image', () => {
  expect(pageTitle({ diffImages: [{}, {}, {}], newImages: [{}] }))
    .toEqual('3 diffs, 1 new · Happo');
});

it('produces the right title with multiple diffs, multiple new images', () => {
  expect(pageTitle({ diffImages: [{}, {}, {}], newImages: [{}, {}, {}] }))
    .toEqual('3 diffs, 3 new · Happo');
});

it('produces the right title with no diffs, one new image', () => {
  expect(pageTitle({ diffImages: [], newImages: [{}] }))
    .toEqual('1 new · Happo');
});

it('produces the right title with no diffs, multiple new images', () => {
  expect(pageTitle({ diffImages: [], newImages: [{}, {}, {}] }))
    .toEqual('3 new · Happo');
});
