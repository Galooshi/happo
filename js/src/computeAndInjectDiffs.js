import adiff from 'adiff';

/**
 * Takes two 2d images, computes the diff between the two, and injects pixels to
 * both in order to:
 * a) make both images the same height
 * b) properly visualize differences
 *
 * Please note that this method MUTATES data.
 */
export default function computeAndInjectDiffs(previousData, currentData) {
  const maxWidth = Math.max(
    previousData[0].length, currentData[0].length);

  const adiffResults = adiff.diff(
    previousData.map(d => btoa(d)), currentData.map(d => btoa(d)));

  const redRow = [];
  for (let i = 0; i < maxWidth; i++) {
    redRow.push([255, 0, 0, 255]);
  }

  const greenRow = [];
  for (let i = 0; i < maxWidth; i++) {
    greenRow.push([0, 255, 0, 255]);
  }

  // iterate and apply changes to previous data
  adiffResults.forEach((instruction) => {
    const atIndex = instruction[0];
    const deletedItems = instruction[1];
    const addedItems = instruction.length - 2;

    for (let y = 0; y < Math.max(deletedItems, addedItems); y++) {
      if (y < deletedItems) {
        // ignore, we just keep the old row
      } else {
        // add a green row to signal an addition
        previousData.splice(atIndex + y, 0, greenRow);
      }
    }
  });

  // iterate backwards and apply changes to current data
  for (let i = adiffResults.length - 1; i >= 0; i--) {
    const instruction = adiffResults[i];
    const atIndex = instruction[0];
    const deletedItems = instruction[1];
    const addedItems = instruction.length - 2;

    for (let y = 0; y < Math.max(deletedItems, addedItems); y++) {
      if (y < addedItems) {
        // ignore, we just keep the old row
      } else {
        currentData.splice(atIndex + y, 0, redRow);
        // add a red row to signal a deletion
      }
    }
  }
}
