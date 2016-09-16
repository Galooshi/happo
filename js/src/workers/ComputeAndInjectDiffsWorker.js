import adiff from 'adiff';

/**
 * Construct a line of pixels of a certain rgba color
 *
 * @param {Array} rgba
 * @param {Number} width
 * @return {Array}
 */
function constructColoredLine(rgba, width) {
  const line = [];
  for (let i = 0; i < width; i++) {
    line.push(rgba);
  }
  return line;
}

/**
 * Takes two 2d images, computes the diff between the two, and injects pixels to
 * both in order to:
 * a) make both images the same height
 * b) properly visualize differences
 *
 * Please note that this method MUTATES data.
 *
 * @param {Array} previousData
 * @param {Array} currentData
 */
function computeAndInjectDiffs({ previousData, currentData }) {
  const maxWidth = Math.max(
    previousData[0].length, currentData[0].length);

  const redLine = constructColoredLine([255, 0, 0, 255], maxWidth);
  const greenLine = constructColoredLine([0, 255, 0, 255], maxWidth);

  const adiffResults = adiff.diff(
    previousData.map(d => btoa(d)), currentData.map(d => btoa(d)));

  // iterate and apply changes to previous data
  adiffResults.forEach((instruction) => {
    const atIndex = instruction[0];
    const deletedItems = instruction[1];
    const addedItems = instruction.length - 2;

    for (let y = 0; y < Math.max(deletedItems, addedItems); y++) {
      if (y < deletedItems) {
        // ignore, we just keep the old line
      } else {
        // add a green line to signal an addition
        previousData.splice(atIndex + y, 0, greenLine);
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
        // ignore, we just keep the old line
      } else {
        // add a red line to signal a deletion
        currentData.splice(atIndex + y, 0, redLine);
      }
    }
  }
}

self.addEventListener('message', ({ data: { previousData, currentData } }) => {
  computeAndInjectDiffs({ previousData, currentData });
  self.postMessage({ previousData, currentData });
  self.close();
});
