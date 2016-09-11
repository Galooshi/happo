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

      const imageData = context.getImageData(0, 0, width, height).data;

      // The imageData is a 1D array. Each element in the array corresponds to a
      // decimal value that represents one of the RGBA channels for that pixel.
      const rowSize = width * 4;
      const getPixelAt = (x, y) => {
        if (x > width || y > height) {
          return undefined;
        }

        const startIndex = (y * rowSize) + (x * 4);
        return [
          imageData[startIndex],
          imageData[startIndex + 1],
          imageData[startIndex + 2],
          imageData[startIndex + 3],
        ];
      };

      resolve({ getPixelAt, width, height });
    };
    imageObj.src = src;
  });
}
