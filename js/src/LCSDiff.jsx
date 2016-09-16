import React, { PropTypes } from 'react';

import computeAndInjectDiffs from './computeAndInjectDiffs';
import getImageData from './getImageData';

const ImageDiffWorker =
  require('worker?inline!./workers/ImageDiffWorker'); // eslint-disable-line

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
      computeAndInjectDiffs(previousData, currentData);

      maxWidth = Math.max(
        previousData[0].length, currentData[0].length);
      maxHeight = previousData.length;

      const worker = new ImageDiffWorker();
      worker.addEventListener('message', (e) => {
        const context = this.canvas.getContext('2d');
        const diffImage = context.createImageData(maxWidth, maxHeight);
        e.data.forEach((value, index) => (diffImage.data[index] = value));
        context.putImageData(diffImage, 0, 0);
      });
      worker.postMessage({ previousData, currentData });
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
