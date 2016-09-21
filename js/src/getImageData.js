/**
 * Get data (pixels, width, height) about an image
 *
 * @param {String} src
 * @return {Promise}
 */
export default function getImageData(src) {
  return new Promise((resolve) => {
    const imageObj = new Image();
    imageObj.onload = () => {
      const { width, height } = imageObj;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      context.drawImage(imageObj, 0, 0);

      const data = context.getImageData(0, 0, width, height).data;
      resolve({ width, height, data });
    };
    imageObj.src = src;
  });
}
