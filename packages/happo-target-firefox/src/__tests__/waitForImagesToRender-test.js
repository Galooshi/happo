import { waitForImageToLoad } from '../waitForImagesToRender';


describe('waitForImagesToRender', () => {
  describe('waitForImageToLoad', () => {
    it('should handle data uris correctly', () => {
      const image = "data:image/svg+xml;utf8,<svg%20viewBox='0%200%2010%2011'%20xmlns='http://www.w3.org/2000/svg'><g%20stroke='%23bfc7d8'%20stroke-width='1.5'%20fill='none'%20fill-rule='evenodd'%20stroke-linecap='round'><path%20d='M5%201.5v8M9%205.5H1'/></g></svg>";
      return waitForImageToLoad(image).then((output) => {
        expect(output.type).toBe('load');
      });
    });

    it('handles image urls', () => {
      const image = 'https://placekitten.com/200/287';
      return waitForImageToLoad(image).then((output) => {
        expect(output.type).toBe('load');
      });
    });

    it('handles image elements', () => {
      const image = {
        src: 'https://placekitten.com/200/287',
      };
      return waitForImageToLoad(image).then((output) => {
        expect(output.type).toBe('load');
      });
    });

    it('handles image elements with crossOrigin attributes', () => {
      const image = {
        src: 'https://placekitten.com/200/287',
        crossOrigin: 'anonymous',
      };
      return waitForImageToLoad(image).then((output) => {
        expect(output.type).toBe('load');
      });
    });
  });
});
