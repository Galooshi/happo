import getDiffPixel from './getDiffPixel';

export default function constructDiffImageData(previousData, currentData) {
  const maxWidth = Math.max(
        previousData[0].length, currentData[0].length);
  const data = new Array(previousData.length * maxWidth * 4);
  previousData.forEach((row, y) => {
    for (let x = 0; x < maxWidth; x++) {
      const pixel = getDiffPixel(
        row[x],
        currentData[y][x]
      );

      const index = (y * maxWidth * 4) + (x * 4);

      data[index + 0] = pixel[0]; // r
      data[index + 1] = pixel[1]; // g
      data[index + 2] = pixel[2]; // b
      data[index + 3] = pixel[3]; // a
    }
  });
  return data;
}
