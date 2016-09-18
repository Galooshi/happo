import euclideanDistance from './euclideanDistance';

export default function getDiffPixel(previousPixel, currentPixel) {
  if (!previousPixel) {
    return currentPixel;
  }

  if (!currentPixel) {
    return previousPixel;
  }

  const diff = euclideanDistance(previousPixel, currentPixel);
  if (diff === 0) {
    return [
      currentPixel[0],
      currentPixel[1],
      currentPixel[2],
      50,
    ];
  }

  return [255, 0, 0, 255 * Math.max(0.2, diff)]; // TODO don't use red here
}
