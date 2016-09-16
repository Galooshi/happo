import getDiffPixel from '../getDiffPixel';

self.addEventListener('message', ({ data: { previousData, currentData } }) => {
  const data = new Uint8ClampedArray(
    previousData.height * previousData.width * 4);

  for (let y = 0; y < previousData.height; y++) {
    for (let x = 0; x < previousData.width; x++) {
      const index = (y * previousData.width * 4) + (x * 4);

      const pixel = getDiffPixel(
        previousData.data.slice(index, index + 4),
        currentData.data.slice(index, index + 4)
      );
      data[index + 0] = pixel[0]; // r
      data[index + 1] = pixel[1]; // g
      data[index + 2] = pixel[2]; // b
      data[index + 3] = pixel[3]; // a
    }
  }
  self.postMessage(data);
  self.close();
});
