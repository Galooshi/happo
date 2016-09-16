import React, { PropTypes } from 'react';

import getImageData from './getImageData';

const ImageDiffWorker =
  require('worker?inline!./workers/ImageDiffWorker'); // eslint-disable-line
const ComputeAndInjectDiffsWorker =
  require('worker?inline!./workers/ComputeAndInjectDiffsWorker'); // eslint-disable-line

export default class LCSDiff extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { previous, current } = this.props;

    Promise.all([
      getImageData(previous),
      getImageData(current),
    ]).then((result) => {
      this.computeDiffs({
        previousData: result[0],
        currentData: result[1],
      });
    });
  }

  computeDiffs({ previousData, currentData }) {
    const worker = new ComputeAndInjectDiffsWorker();
    worker.addEventListener('message', ({
      data: {
        previousData: newPreviousData,
        currentData: newCurrentData,
      },
    }) => {
      this.setState({
        width: Math.max(newPreviousData[0].length, newCurrentData[0].length),
        height: newCurrentData.length,
      });

      this.constructDiffImage({
        previousData: newPreviousData,
        currentData: newCurrentData,
      });
    });
    worker.postMessage({ previousData, currentData });
  }

  constructDiffImage({ previousData, currentData }) {
    const worker = new ImageDiffWorker();
    worker.addEventListener('message', (e) => {
      const context = this.canvas.getContext('2d');
      const diffImage = context.createImageData(
        this.state.width, this.state.height);
      e.data.forEach((value, index) => (diffImage.data[index] = value));
      context.putImageData(diffImage, 0, 0);
    });
    worker.postMessage({ previousData, currentData });
  }

  render() {
    const {
      width,
      height,
    } = this.state;

    return (
      <canvas
        ref={(node) => { this.canvas = node; }}
        width={width}
        height={height}
      />
    );
  }
}
LCSDiff.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};
