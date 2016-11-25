import getDiffPixel from '../getDiffPixel';

const GRAY = [100, 100, 100, 255];
const GREEN = [0, 200, 0, 255];
const RED = [255, 0, 0, 255];

const GUTTER_WIDTH = 20 * 4;
const GUTTER_GAP = 4 * 4;

function getDataIndex(row, width, index) {
  return (GUTTER_WIDTH * (row + 1)) + (width * row) + index;
}

self.addEventListener('message', ({
  data: {
    previousImageData,
    currentImageData,
  },
}) => {
  const width = previousImageData[0].length;
  const height = previousImageData.length;

  const diffImageSize = (GUTTER_WIDTH + width) * height;

  const data = new Uint8ClampedArray(diffImageSize);

  for (let row = 0; row < height; row++) {
    // Render image
    let isRowChanged = false;
    for (let index = 0; index < width; index += 4) {
      const { diff, pixel } = getDiffPixel(
        [
          previousImageData[row][index],
          previousImageData[row][index + 1],
          previousImageData[row][index + 2],
          previousImageData[row][index + 3],
        ],
        [
          currentImageData[row][index],
          currentImageData[row][index + 1],
          currentImageData[row][index + 2],
          currentImageData[row][index + 3],
        ],
      );

      if (diff > 0) {
        isRowChanged = true;
      }

      const dataIndex = getDataIndex(row, width, index);
      data[dataIndex + 0] = pixel[0]; // r
      data[dataIndex + 1] = pixel[1]; // g
      data[dataIndex + 2] = pixel[2]; // b
      data[dataIndex + 3] = pixel[3]; // a
    }

    // Render gutter
    let gutterColor;
    if (previousImageData[row][3] === 0) {
      // Pixel is transparent in previous image, which means that a row was
      // added here.
      gutterColor = GREEN;
    } else if (currentImageData[row][3] === 0) {
      // Pixel is transparent in current image, which means that a row was
      // removed here.
      gutterColor = RED;
    } else if (isRowChanged) {
      gutterColor = GRAY;
    } else {
      gutterColor = null;
    }

    for (let index = 0; index < GUTTER_WIDTH - GUTTER_GAP; index += 4) {
      if (gutterColor !== null) {
        const dataIndex = getDataIndex(row, width, index) - GUTTER_WIDTH;
        data[dataIndex + 0] = gutterColor[0];
        data[dataIndex + 1] = gutterColor[1];
        data[dataIndex + 2] = gutterColor[2];
        data[dataIndex + 3] = gutterColor[3];
      }
    }
  }

  self.postMessage({
    data,
    width: (GUTTER_WIDTH + width) / 4,
    height,
  });

  self.close();
});
