import compose from './compose';
import euclideanDistance, { MAX_EUCLIDEAN_DISTANCE } from './euclideanDistance';

const WHITE = [255, 255, 255, 255];

export default function getDiffPixel(previousPixel, currentPixel) {
  if (!previousPixel) {
    return currentPixel;
  }

  if (!currentPixel) {
    return previousPixel;
  }

  const diff = euclideanDistance(previousPixel, currentPixel) / MAX_EUCLIDEAN_DISTANCE;
  if (diff === 0) {
    return compose(
      [currentPixel[0], currentPixel[1], currentPixel[2], 50],
      WHITE
    );
  }

  return compose(
    [179, 54, 130, 255 * Math.max(0.2, diff)],
    WHITE
  );
}
