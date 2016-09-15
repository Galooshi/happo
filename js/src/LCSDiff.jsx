import adiff from 'adiff';

import React, { PropTypes } from 'react';

import getDiffPixel from './getDiffPixel';
import getImageData from './getImageData';

export default class LCSDiff extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previousData: null,
      currentData: null,
    };
  }

  componentDidMount() {
    const { previous, current } = this.props;

    getImageData(previous).then((previousData) => {
      this.setState({ previousData });
    });

    getImageData(current).then((currentData) => {
      this.setState({ currentData });
    });
  }

  render() {
    const { previousData, currentData } = this.state;

    let maxWidth;
    let maxHeight;

    if (previousData && currentData) {
      maxWidth = Math.max(
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

      maxHeight = previousData.length;

      setTimeout(() => {
        const context = this.canvas.getContext('2d');
        const diffImage = context.createImageData(maxWidth, maxHeight);
        const d = diffImage.data;

        previousData.forEach((row, y) => {
          for (let x = 0; x < maxWidth; x++) {
            const pixel = getDiffPixel(
              row[x],
              currentData[y][x]
            );

            const index = (y * maxWidth * 4) + (x * 4);

            d[index + 0] = pixel[0]; // r
            d[index + 1] = pixel[1]; // g
            d[index + 2] = pixel[2]; // b
            d[index + 3] = pixel[3]; // a
          }
        });

        context.putImageData(diffImage, 0, 0);
      }, 0);
    }

    return (
      <canvas
        width={maxWidth}
        height={maxHeight}
        ref={(node) => { this.canvas = node; }}
      />
    );
  }
}
LCSDiff.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};
