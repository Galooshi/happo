import imageSlug from '../imageSlug';

it('can slug-ify non-latin characters', () => {
  expect(() =>
    imageSlug({
      description: '“curly quotes”',
      viewport: 'small',
    }),
  ).not.toThrowError();
});
