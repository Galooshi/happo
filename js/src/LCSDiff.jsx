import React, { PropTypes } from 'react';

import computeAndInjectDiffs from './computeAndInjectDiffs';
import constructDiffImageData from './constructDiffImageData';
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
      computeAndInjectDiffs(previousData, currentData);

      maxWidth = Math.max(
        previousData[0].length, currentData[0].length);
      maxHeight = previousData.length;

      setTimeout(() => {
        const diffData = constructDiffImageData(previousData, currentData);
        const context = this.canvas.getContext('2d');
        const diffImage = context.createImageData(maxWidth, maxHeight);
        diffData.forEach((value, index) => (diffImage.data[index] = value));
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
