import getDiffPixel from '../getDiffPixel';

self.addEventListener('message', ({
  data: {
    previousImageData,
    currentImageData,
  },
}) => {
  const data = new Uint8ClampedArray(previousImageData.length);

  for (let i = 0; i < previousImageData.length; i += 4) {
    const pixel = getDiffPixel(
      [
        previousImageData[i],
        previousImageData[i + 1],
        previousImageData[i + 2],
        previousImageData[i + 3],
      ],
      [
        currentImageData[i],
        currentImageData[i + 1],
        currentImageData[i + 2],
        currentImageData[i + 3],
      ]
    );
    data[i + 0] = pixel[0]; // r
    data[i + 1] = pixel[1]; // g
    data[i + 2] = pixel[2]; // b
    data[i + 3] = pixel[3]; // a
  }
  self.postMessage(data);
  self.close();
});
