import getUrlsFromSrcset from '../getUrlsFromSrcset';

it('handles invalid values', () => {
  expect(getUrlsFromSrcset('      ')).toEqual([]);
});

it('handles single urls without descriptor', () => {
  expect(getUrlsFromSrcset('/foo.png')).toEqual(['/foo.png']);
});

it('handles single urls with commas', () => {
  expect(getUrlsFromSrcset('/foo,40,50.png')).toEqual(['/foo,40,50.png']);
});

it('handles single urls with a width descriptor', () => {
  expect(getUrlsFromSrcset('http://foo.com/foo.png 200w')).toEqual(['http://foo.com/foo.png']);
});

it('handles single urls with a pixel density descriptor', () => {
  expect(getUrlsFromSrcset('http://foo.com/foo.png 1.2x')).toEqual(['http://foo.com/foo.png']);
});

it('strips whitespace', () => {
  expect(getUrlsFromSrcset(`
    /foo.png`)).toEqual(['/foo.png']);
});

it('handles multiple urls', () => {
  expect(getUrlsFromSrcset('/foo.png 200w,/bar.png 400w')).toEqual(['/foo.png', '/bar.png']);
});

it('handles multiple urls with commas', () => {
  expect(getUrlsFromSrcset('http://foo.com/foo,40,50 200w,/bar,20.png 400w')).toEqual(['http://foo.com/foo,40,50', '/bar,20.png']);
});

it('handles multiple urls with whitespace', () => {
  expect(getUrlsFromSrcset(`
  http://foo.com/foo,40,50 200w,
  /bar,20.png         400w


  `)).toEqual(['http://foo.com/foo,40,50', '/bar,20.png']);
});

it('handles multiple URLs with mixed descriptors', () => {
  expect(getUrlsFromSrcset('/foo.png, /bar.png 400w')).toEqual(['/foo.png', '/bar.png']);
});
