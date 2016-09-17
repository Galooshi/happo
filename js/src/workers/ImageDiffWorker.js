import getDiffPixel from '../getDiffPixel';

self.addEventListener('message', ({
  data: {
    previousImageData: p,
    currentImageData: c,
  },
}) => {
  const data = new Uint8ClampedArray(p.length);

  for (let i = 0; i < p.length; i += 4) {
    const pixel = getDiffPixel(
      [p[i], p[i + 1], p[i + 2], p[i + 3]],
      [c[i], c[i + 1], c[i + 2], c[i + 3]]
    );
    data[i + 0] = pixel[0]; // r
    data[i + 1] = pixel[1]; // g
    data[i + 2] = pixel[2]; // b
    data[i + 3] = pixel[3]; // a
  }
  self.postMessage(data);
  self.close();
});
