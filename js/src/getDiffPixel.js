import euclideanDistance from './euclideanDistance';

export default function getDiffPixel(previousPixel, currentPixel) {
  if (!previousPixel) {
    return currentPixel;
  }

  if (!currentPixel) {
    return previousPixel;
  }

  let diff = euclideanDistance(previousPixel, currentPixel);
  if (diff === 0) {
    return [
      currentPixel[0],
      currentPixel[1],
      currentPixel[2],
      50,
    ];
  }

  if (diff < 0.2) {
    diff = 0.2;
  }
  return [255, 0, 0, 255 * diff]; // TODO don't use red here
}
