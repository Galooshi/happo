import React, { PropTypes } from 'react';

const HIDE_MS = 500;

export default class SmoothProgress extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: 0,
      visible: false,
    };
    this.tick = this.tick.bind(this);
    this.tick(0);
    setTimeout(() => {
      this.setState({ visible: true });
    }, HIDE_MS);
  }

  componentWillReceiveProps(nextProps) {
    clearTimeout(this.timeout);
    this.tick(nextProps.value);
  }

  tick(targetValue) {
    const { currentValue } = this.state;
    const diff = targetValue - currentValue;
    this.setState({
      currentValue: currentValue + (diff * 0.8),
    });

    this.timeout = setTimeout(() => {
      this.tick(targetValue);
    }, 1000);
  }

  render() {
    const {
      currentValue,
      visible,
    } = this.state;

    return (
      <div
        style={{
          opacity: visible ? 1 : 0,
        }}
        className='SmoothProgress'
      >
        <div
          style={{
            transform: `translateX(-${100 - currentValue}%)`,
          }}
          className='SmoothProgress__bar'
        />
      </div>
    );
  }
}
SmoothProgress.propTypes = {
  value: PropTypes.number.isRequired,
};
