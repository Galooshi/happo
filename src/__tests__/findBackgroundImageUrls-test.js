import findBackgroundImageUrls from '../findBackgroundImageUrls';

it('ignores non-images', () => {
  expect(findBackgroundImageUrls(
    'linear-gradient(to right, rgba(30, 75, 115, 1)')).toEqual([]);
});

it('finds urls without quotes', () => {
  expect(findBackgroundImageUrls('url(http://example.com/1.png)')).toEqual([
    'http://example.com/1.png',
  ]);
});

it('finds urls with single quotes', () => {
  expect(findBackgroundImageUrls("url('http://example.com/1.png')")).toEqual([
    'http://example.com/1.png',
  ]);
});

it('finds urls with double quotes', () => {
  expect(findBackgroundImageUrls('url("http://example.com/1.png")')).toEqual([
    'http://example.com/1.png',
  ]);
});

it('finds local urls', () => {
  expect(findBackgroundImageUrls('url("1.png")')).toEqual([
    '1.png',
  ]);
});

it('finds multiple urls', () => {
  expect(findBackgroundImageUrls(
    'url("1.png"), url("http://example.com/2.png")'))
    .toEqual([
      '1.png',
      'http://example.com/2.png',
    ]);
});

it('finds urls surrounded by non-urls', () => {
  expect(findBackgroundImageUrls(
    'linear-gradient(to left, #000000), url("http://example.com/2.png"), element(#foo)'))
    .toEqual([
      'http://example.com/2.png',
    ]);
});
