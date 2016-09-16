/**
 * @param {Array} imageData a 2d array
 * @return {Uint8ClampedArray}
 */
export default function flattenImageData(imageData) {
  const width = imageData[0].length;
  const result = new Uint8ClampedArray(imageData.length * width * 4);
  imageData.forEach((row, y) => {
    row.forEach((pixel, x) => {
      const index = (y * width * 4) + (x * 4);
      result[index] = pixel[0];
      result[index + 1] = pixel[1];
      result[index + 2] = pixel[2];
      result[index + 3] = pixel[3];
    });
  });
  return result;
}
