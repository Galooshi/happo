import { waitForImageToLoad } from '../waitForImagesToRender';

const image = "data:image/svg+xml;utf8,<svg%20viewBox='0%200%2010%2011'%20xmlns='http://www.w3.org/2000/svg'><g%20stroke='%23bfc7d8'%20stroke-width='1.5'%20fill='none'%20fill-rule='evenodd'%20stroke-linecap='round'><path%20d='M5%201.5v8M9%205.5H1'/></g></svg>";

describe('waitForImagesToRender', () => {
  describe('waitForImageToLoad', () => {
    it('should handle data uris correctly', () => (
      waitForImageToLoad(image).then((output) => {
        expect(output.type).toBe('load');
      })
    ));
  });
});
