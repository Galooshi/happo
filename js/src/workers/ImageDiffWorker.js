import getDiffPixel from '../getDiffPixel';

self.addEventListener('message', ({
  data: {
    previousImageData,
    currentImageData,
  },
}) => {
  const width = previousImageData[0].length;
  const height = previousImageData.length;
  const size = width * height;

  const data = new Uint8ClampedArray(size);

  for (let row = 0; row < height; row++) {
    for (let index = 0; index < width; index += 4) {
      const pixel = getDiffPixel(
        [
          previousImageData[row][index],
          previousImageData[row][index + 1],
          previousImageData[row][index + 2],
          previousImageData[row][index + 3],
        ],
        [
          currentImageData[row][index],
          currentImageData[row][index + 1],
          currentImageData[row][index + 2],
          currentImageData[row][index + 3],
        ]
      );

      const dataIndex = (row * width) + index;
      data[dataIndex + 0] = pixel[0]; // r
      data[dataIndex + 1] = pixel[1]; // g
      data[dataIndex + 2] = pixel[2]; // b
      data[dataIndex + 3] = pixel[3]; // a
    }
  }

  self.postMessage(data);
  self.close();
});
