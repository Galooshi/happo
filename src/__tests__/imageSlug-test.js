import imageSlug from '../imageSlug';

describe('imageSlug', () => {
  it('can slug-ify non-latin characters', () => {
    expect(() =>
      imageSlug({
        description: '“curly quotes”',
        viewport: 'small',
      }),
    ).not.toThrowError();
  });
});
