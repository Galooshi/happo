import React, { PropTypes } from 'react';

import maxImageSize from './maxImageSize';

export default class Swiper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorLeft: 0,
      height: 'auto',
      width: 'auto',
    };
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentWillMount() {
    this.updateSize(this.props)
      .then(({ width }) => {
        // Start in the center
        this.setState({ cursorLeft: width / 2 });
      });
  }

  componentWillReceiveProps(nextProps) {
    this.updateSize(nextProps);
  }

  updateSize({ current, previous }) {
    const sizes = maxImageSize(current, previous)
      .then(({ width, height }) => {
        this.setState({ width, height });
        return { width, height };
      });

    return Promise.resolve(sizes);
  }

  handleMouseMove(event) {
    this.setState({
      cursorLeft: event.pageX - event.target.offsetLeft,
    });
  }

  render() {
    const { previous, current } = this.props;
    const { cursorLeft, height, width } = this.state;

    return (
      <div
        className='Swiper'
        style={{ height, width }}
        onMouseMove={this.handleMouseMove}
      >
        <div
          className='Swiper__image'
          style={{ width: cursorLeft }}
        >
          <img
            src={previous}
            role='presentation'
          />
        </div>

        <div
          className='Swiper__image'
          style={{
            transform: `translateX(${cursorLeft}px)`,
            width: width - cursorLeft,
          }}
        >
          <img
            src={current}
            style={{
              transform: `translateX(-${cursorLeft}px)`,
            }}
            role='presentation'
          />
        </div>

        <div
          className='Swiper__cursor'
          style={{
            transform: `translateX(${cursorLeft}px)`,
          }}
        />
      </div>
    );
  }
}
Swiper.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};
