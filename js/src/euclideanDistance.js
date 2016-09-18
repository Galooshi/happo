/**
 * Compute a score that represents the difference between 2 pixels
 *
 * This method simply takes the Euclidean distance between the RGBA channels
 * of 2 colors over the maximum possible Euclidean distance. This gives us a
 * percentage of how different the two colors are.
 *
 * Although it would be more perceptually accurate to calculate a proper
 * Delta E in Lab colorspace, we probably don't need perceptual accuracy for
 * this application, and it is nice to avoid the overhead of converting RGBA
 * to Lab.
 */
export default function euclideanDistance(rgba1, rgba2) {
  return Math.sqrt(
    Math.pow(rgba1[0] - rgba2[0], 2)
    + Math.pow(rgba1[1] - rgba2[1], 2)
    + Math.pow(rgba1[2] - rgba2[2], 2)
    + Math.pow(rgba1[3] - rgba2[3], 2)
  );
}

export const MAX_EUCLIDEAN_DISTANCE = Math.sqrt(Math.pow(255, 2) * 4);
