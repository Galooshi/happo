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

it('handle escaped quote in data uris', () => {
  expect(findBackgroundImageUrls(
    'url("data:image/svg+xml;utf8,<svg%20viewBox=\\\'0%200%2010%209\\\'%20xmlns=\\\'http://www.w3.org/2000/svg\\\'><path%20d=\\\'M1%204.88l2.378%202.435L9.046%201.6\\\'%20stroke-width=\\\'1.6\\\'%20stroke=\\\'%23FFF\\\'%20fill=\\\'none\\\'%20fill-rule=\\\'evenodd\\\'%20stroke-linecap=\\\'round\\\'%20stroke-linejoin=\\\'round\\\'/></svg>")'))
    .toEqual([
      "data:image/svg+xml;utf8,<svg%20viewBox='0%200%2010%209'%20xmlns='http://www.w3.org/2000/svg'><path%20d='M1%204.88l2.378%202.435L9.046%201.6'%20stroke-width='1.6'%20stroke='%23FFF'%20fill='none'%20fill-rule='evenodd'%20stroke-linecap='round'%20stroke-linejoin='round'/></svg>",
    ]);
});
