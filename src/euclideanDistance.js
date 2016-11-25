export default function euclideanDistance(rgba1, rgba2) {
  return Math.sqrt(
    ((rgba1[0] - rgba2[0]) ** 2)
    + ((rgba1[1] - rgba2[1]) ** 2)
    + ((rgba1[2] - rgba2[2]) ** 2)
    + ((rgba1[3] - rgba2[3]) ** 2),
  );
}

export const MAX_EUCLIDEAN_DISTANCE = Math.sqrt((255 ** 2) * 4);
