import compose from './compose';
import euclideanDistance from './euclideanDistance';

const WHITE = [255, 255, 255, 255];

export default function getDiffPixel(previousPixel, currentPixel) {
  if (!previousPixel) {
    return currentPixel;
  }

  if (!currentPixel) {
    return previousPixel;
  }

  const diff = euclideanDistance(previousPixel, currentPixel);
  if (diff === 0) {
    return compose(
      [currentPixel[0], currentPixel[1], currentPixel[2], 50],
      WHITE
    );
  }

  return compose(
    [255, 0, 0, 255 * Math.max(0.2, diff)], // TODO don't use red here
    WHITE
  );
}
