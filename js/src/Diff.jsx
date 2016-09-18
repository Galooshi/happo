import React, { PropTypes } from 'react';

import ImageHeading from './ImageHeading';
import SelectedView from './SelectedView';
import VIEWS from './VIEWS';
import imageShape from './imageShape';

export class DiffController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedView: VIEWS.DIFF,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(view) {
    this.setState({ selectedView: view });
  }

  render() {
    return (
      <Diff
        image={this.props.image}
        selectedView={this.state.selectedView}
        onClick={this.handleClick}
      />
    );
  }
}
DiffController.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
};

export default function Diff({ image, selectedView, onClick }) {
  // Compute minHeight based on the height of the largest image, plus 10% to
  // leave room for some additional height needed by the diff view.
  const minHeight = image.height + (image.height / 10);

  return (
    <div>
      <ImageHeading
        image={image}
      />
      <div className='Diff__buttons'>
        {Object.keys(VIEWS).map(key => VIEWS[key]).map((view, i) => {
          const classes = ['Diff__button'];
          if (i === 0) {
            classes.push('Diff__button--first');
          } else if (i === Object.keys(VIEWS).length - 1) {
            classes.push('Diff__button--last');
          }

          return (
            <button
              key={view}
              className={classes.join(' ')}
              aria-pressed={view === selectedView}
              onClick={() => { onClick(view); }}
            >
              {view}
            </button>
          );
        })}
      </div>
      <div
        className='Diff__images'
        style={{
          minHeight,
        }}
      >
        <SelectedView image={image} selectedView={selectedView} />
      </div>
    </div>
  );
}
Diff.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
  onClick: PropTypes.func.isRequired,
  selectedView: PropTypes.oneOf(Object.keys(VIEWS).map(key => VIEWS[key])).isRequired,
};
