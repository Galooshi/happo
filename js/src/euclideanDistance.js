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
 *
 * Returns a float number between 0 and 1 where 1 is completely different
 * and 0 is no difference
 */
export default function euclideanDistance(rgba1, rgba2) {
  const distance = ((rgba1[0] - rgba2[0]) * (rgba1[0] - rgba2[0]))
                 + ((rgba1[1] - rgba2[1]) * (rgba1[1] - rgba2[1]))
                 + ((rgba1[2] - rgba2[2]) * (rgba1[2] - rgba2[2]))
                 + ((rgba1[3] - rgba2[3]) * (rgba1[3] - rgba2[3]));

  return (Math.sqrt(distance) / 4) / 255;
}
