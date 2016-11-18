const pageTitle = require('../pageTitle');

describe('with no diffs or new images', () => {
  it('produces a reasonable title', () => {
    expect(pageTitle({ diffImages: [], newImages: [] })).toEqual('Happo');
  });
});

describe('with one diff, no new images', () => {
  it('produces the right title', () => {
    expect(pageTitle({ diffImages: [{}], newImages: [] })).toEqual('1 diff · Happo');
  });
});

describe('with multiple diffs, no new images', () => {
  it('produces the right title', () => {
    expect(pageTitle({ diffImages: [{}, {}, {}], newImages: [] }))
      .toEqual('3 diffs · Happo');
  });
});

describe('with multiple diffs, one new image', () => {
  it('produces the right title', () => {
    expect(pageTitle({ diffImages: [{}, {}, {}], newImages: [{}] }))
      .toEqual('3 diffs, 1 new · Happo');
  });
});

describe('with multiple diffs, multiple new images', () => {
  it('produces the right title', () => {
    expect(pageTitle({ diffImages: [{}, {}, {}], newImages: [{}, {}, {}] }))
      .toEqual('3 diffs, 3 new · Happo');
  });
});

describe('with no diffs, one new image', () => {
  it('produces the right title', () => {
    expect(pageTitle({ diffImages: [], newImages: [{}] }))
      .toEqual('1 new · Happo');
  });
});

describe('with no diffs, multiple new images', () => {
  it('produces the right title', () => {
    expect(pageTitle({ diffImages: [], newImages: [{}, {}, {}] }))
      .toEqual('3 new · Happo');
  });
});
