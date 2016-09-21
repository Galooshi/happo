/**
 * @param {Array} imageData a 2d array
 * @return {Uint8ClampedArray}
 */
export default function flattenImageData(imageData) {
  const width = imageData[0].length;
  const result = new Uint8ClampedArray(imageData.length * width);
  imageData.forEach((row, y) => {
    row.forEach((channel, x) => {
      const index = (y * width) + x;
      result[index] = channel;
    });
  });
  return result;
}
