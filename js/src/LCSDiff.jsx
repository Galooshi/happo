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
      maxWidth = Math.max(previousData.width, currentData.width);
      maxHeight = Math.max(previousData.height, currentData.height);

      setTimeout(() => {
        const context = this.canvas.getContext('2d');
        const diffImage = context.createImageData(maxWidth, maxHeight);
        const d = diffImage.data;

        for (let y = 0; y < maxHeight; y++) {
          for (let x = 0; x < maxWidth; x++) {
            const pixel = getDiffPixel(
              previousData.getPixelAt(x, y),
              currentData.getPixelAt(x, y)
            );
            const index = ((y * maxWidth) + x) * 4;

            d[index + 0] = pixel[0]; // r
            d[index + 1] = pixel[1]; // g
            d[index + 2] = pixel[2]; // b
            d[index + 3] = pixel[3]; // a
          }
        }

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
