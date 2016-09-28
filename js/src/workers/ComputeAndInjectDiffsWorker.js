import alignArrays, { PLACEHOLDER } from '../alignArrays';

function imageTo2DArray({ data, width, height }, paddingRight) {
  // The imageData is a 1D array. Each element in the array corresponds to a
  // decimal value that represents one of the RGBA channels for that pixel.
  const rowSize = width * 4;

  const newData = [];
  for (let row = 0; row < height; row++) {
    const pixelsInRow = new Uint8ClampedArray(rowSize + (paddingRight * 4));
    for (let location = 0; location < rowSize; location++) {
      pixelsInRow[location] = data[(row * rowSize) + location];
    }
    newData.push(pixelsInRow);
  }
  return newData;
}

// Safari has a bug where trying to reference `btoa` inside a web worker will
// result in an error, so we fall back to the slower (?) `JSON.stringify`. The
// only way to prevent this seems to be by using a try/catch. We do this in its
// own function to prevent our align function from being de-optimized.
//
// https://bugs.webkit.org/show_bug.cgi?id=158576
function hashFn() {
  try {
    return btoa;
  } catch (e) {
    return JSON.stringify;
  }
}

const HASH_FN = hashFn();

function align({
  previousImageData,
  currentImageData,
  maxWidth,
}) {
  const hashedPreviousData = previousImageData.map(HASH_FN);
  self.postMessage({ progress: 40 });
  const hashedCurrentData = currentImageData.map(HASH_FN);
  self.postMessage({ progress: 60 });

  alignArrays(
    hashedPreviousData,
    hashedCurrentData
  );

  const transparentLine = new Uint8ClampedArray(maxWidth * 4);

  hashedPreviousData.forEach((hashedLine, i) => {
    if (hashedLine === PLACEHOLDER) {
      previousImageData.splice(i, 0, transparentLine);
    }
  });

  hashedCurrentData.forEach((hashedLine, i) => {
    if (hashedLine === PLACEHOLDER) {
      currentImageData.splice(i, 0, transparentLine);
    }
  });
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

  const previousImageData = imageTo2DArray(
    previousData, maxWidth - previousData.width);

  const currentImageData = imageTo2DArray(
    currentData, maxWidth - currentData.width);

  self.postMessage({ progress: 20 });

  align({
    previousImageData,
    currentImageData,
    maxWidth,
  });

  self.postMessage({ progress: 85 });

  return {
    currentData: {
      data: currentImageData,
      height: currentImageData.length,
      width: maxWidth,
    },
    previousData: {
      data: previousImageData,
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
