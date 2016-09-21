import adiff from 'adiff';

import flattenImageData from '../flattenImageData';

const TRANSPARENT_PIXEL = [0, 0, 0, 0];

/**
 * Construct a line of transparent pixels
 *
 * @param {Number} width
 * @return {Array}
 */
function constructTransparentLine(width) {
  const line = [];
  for (let i = 0; i < width; i++) {
    line.push(TRANSPARENT_PIXEL);
  }
  return line;
}

function imageTo2DArray({ data, width, height }, paddingRight) {
  // The imageData is a 1D array. Each element in the array corresponds to a
  // decimal value that represents one of the RGBA channels for that pixel.
  const rowSize = width * 4;
  const getPixelAt = (x, y) => {
    const startIndex = (y * rowSize) + (x * 4);
    return [
      data[startIndex],
      data[startIndex + 1],
      data[startIndex + 2],
      data[startIndex + 3],
    ];
  };

  const newData = [];
  for (let row = 0; row < height; row++) {
    const pixelsInRow = [];
    for (let col = 0; col < width; col++) {
      pixelsInRow.push(getPixelAt(col, row));
    }
    for (let pad = 0; pad < paddingRight; pad++) {
      pixelsInRow.push([0, 0, 0, 0]);
    }
    newData.push(pixelsInRow);
  }
  return newData;
}

function getAdiffResults({
  previousData,
  currentData,
  previousImageData,
  currentImageData,
}) {
  if (previousData.width !== currentData.width) {
    // we know that all rows will be different here, so we can take a shortcut
    const diff = [
      0, // diff starts at index 0
      previousData.height, // number of deletions
    ];
    diff.length = currentData.height + 2; // number of additions
    return [diff];
  }

  const hashedPreviousData = previousImageData.map(JSON.stringify);
  self.postMessage({ progress: 40 });
  const hashedCurrentData = currentImageData.map(JSON.stringify);
  self.postMessage({ progress: 60 });

  return adiff.diff(
    hashedPreviousData,
    hashedCurrentData
  );
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
  const maxWidth = Math.max(previousData.width, currentData.width);

  const transparentLine = constructTransparentLine(maxWidth);

  const previousImageData = imageTo2DArray(
    previousData, maxWidth - previousData.width);

  const currentImageData = imageTo2DArray(
    currentData, maxWidth - currentData.width);

  self.postMessage({ progress: 20 });

  const adiffResults = getAdiffResults({
    previousData,
    currentData,
    previousImageData,
    currentImageData,
  });

  self.postMessage({ progress: 85 });

  // iterate and apply changes to previous data
  adiffResults.forEach((instruction) => {
    const atIndex = instruction[0];
    const deletedItems = instruction[1];
    const addedItems = instruction.length - 2;

    for (let y = 0; y < Math.max(deletedItems, addedItems); y++) {
      if (y < deletedItems) {
        // ignore, we just keep the old line
      } else {
        previousImageData.splice(atIndex + y, 0, transparentLine);
      }
    }
  });
  self.postMessage({ progress: 95 });

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
        currentImageData.splice(atIndex + y, 0, transparentLine);
      }
    }
  }
  self.postMessage({ progress: 98 });

  return {
    currentData: {
      data: flattenImageData(currentImageData),
      height: currentImageData.length,
      width: maxWidth,
    },
    previousData: {
      data: flattenImageData(previousImageData),
      height: previousImageData.length,
      width: maxWidth,
    },
  };
}

self.addEventListener('message', ({ data: { previousData, currentData } }) => {
  const result = computeAndInjectDiffs({ previousData, currentData });
  self.postMessage(result);
  self.close();
});
