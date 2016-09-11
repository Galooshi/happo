export default function maxImageSize(...imageUrls) {
  const dimensions = {};

  return new Promise((resolve, reject) => {
    imageUrls.forEach((url, i) => {
      const image = new Image();

      image.onerrer = function handleImageError(e) {
        reject(e);
      };

      image.onload = function handleImageLoad() {
        const { width, height } = this;

        // Use the index in case the URL is somehow duplicated.
        dimensions[i] = { width, height };

        if (Object.keys(dimensions).length >= imageUrls.length) {
          // We are done, so compute the max width and height and resolve.
          const values = Object.keys(dimensions).map(key => dimensions[key]);
          const maxWidth = Math.max(...values.map(value => value.width));
          const maxHeight = Math.max(...values.map(value => value.height));
          resolve({ width: maxWidth, height: maxHeight });
        }
      };

      image.src = url;
    });
  });
}
