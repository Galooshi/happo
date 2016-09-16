/**
 * @param {Array} imageData a 2d array
 * @return {Uint8ClampedArray}
 */
export default function flattenImageData(imageData) {
  const result = [];
  imageData.forEach((row) => {
    row.forEach((pixel) => {
      result.push(...pixel);
    });
  });
  return Uint8ClampedArray.from(result);
}
