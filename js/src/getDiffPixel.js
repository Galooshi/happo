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

  // Compute a score that represents the difference between 2 pixels
  //
  // This method simply takes the Euclidean distance between the RGBA channels
  // of 2 colors over the maximum possible Euclidean distance. This gives us a
  // percentage of how different the two colors are.
  //
  // Although it would be more perceptually accurate to calculate a proper
  // Delta E in Lab colorspace, we probably don't need perceptual accuracy for
  // this application, and it is nice to avoid the overhead of converting RGBA
  // to Lab.
  const diff = euclideanDistance(previousPixel, currentPixel) / MAX_EUCLIDEAN_DISTANCE;

  if (diff === 0) {
    return compose(
      [currentPixel[0], currentPixel[1], currentPixel[2], 40],
      WHITE
    );
  }

  return compose(
    [179, 54, 130, 255 * Math.max(0.2, diff)],
    WHITE
  );
}
