import React, { PropTypes } from 'react';
import ReactWaypoint from 'react-waypoint';

import SmoothProgress from './SmoothProgress';
import getImageData from './getImageData';

const ImageDiffWorker =
  require('worker?inline!./workers/ImageDiffWorker'); // eslint-disable-line
const ComputeAndInjectDiffsWorker =
  require('worker?inline!./workers/ComputeAndInjectDiffsWorker'); // eslint-disable-line

export default class LCSDiff extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      width: 0,
      height: 0,
    };
    this.initialize = this.initialize.bind(this);
  }

  initialize() {
    const { previous, current } = this.props;

    Promise.all([
      getImageData(previous),
      getImageData(current),
    ]).then(([previousData, currentData]) => {
      this.setState({
        progress: 10,
        width: previousData.width,
        height: previousData.height,
      });
      this.computeDiffs({
        previousData,
        currentData,
      });
    });
  }

  computeDiffs({ previousData, currentData }) {
    const worker = new ComputeAndInjectDiffsWorker();
    worker.addEventListener('message', ({
      data: {
        previousData: newPreviousData,
        currentData: newCurrentData,
        progress,
      },
    }) => {
      if (!newPreviousData) {
        // This is only a progress message, not the final results
        this.setState({ progress });
        return;
      }

      // At this point, images are of same width
      this.setState({
        width: newPreviousData.width,
        height: newPreviousData.height,
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
    worker.addEventListener('message', ({ data }) => {
      const context = this.canvas.getContext('2d');
      const diffImage = context.createImageData(
        this.state.width, this.state.height);
      diffImage.data.set(data);
      context.putImageData(diffImage, 0, 0);
      this.setState({ progress: 100 });
    });
    worker.postMessage({
      previousImageData: previousData.data,
      currentImageData: currentData.data,
    });
  }

  render() {
    const {
      width,
      height,
      progress,
    } = this.state;

    return (
      <div
        style={{
          height,
          width,
        }}
      >
        {progress < 100 &&
          <SmoothProgress
            value={progress}
          />
        }
        {progress === 0 &&
          <ReactWaypoint
            onEnter={this.initialize}
            scrollableAncestor={window}
            bottomOffset='-50%'
          />
        }
        <canvas
          ref={(node) => { this.canvas = node; }}
          width={width}
          height={height}
        />
      </div>
    );
  }
}
LCSDiff.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};
