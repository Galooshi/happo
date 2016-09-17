import getDiffPixel from '../getDiffPixel';

self.addEventListener('message', ({ data: { previousData, currentData } }) => {
  const data = new Uint8ClampedArray(previousData.data.length);

  for (let i = 0; i < previousData.data.length; i += 4) {
    const pixel = getDiffPixel(
      previousData.data.slice(i, i + 4),
      currentData.data.slice(i, i + 4)
    );
    data[i + 0] = pixel[0]; // r
    data[i + 1] = pixel[1]; // g
    data[i + 2] = pixel[2]; // b
    data[i + 3] = pixel[3]; // a
  }
  self.postMessage(data);
  self.close();
});
