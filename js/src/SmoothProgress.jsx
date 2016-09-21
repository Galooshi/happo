import React, { PropTypes } from 'react';

export default class SmoothProgress extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: 0,
    };
    this.tick = this.tick.bind(this);
    this.tick(0);
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
    const { currentValue } = this.state;
    return (
      <div>
        <div className='SmoothProgress'>
          <div
            style={{
              transform: `translateX(-${100 - currentValue}%)`,
            }}
            className='SmoothProgress__bar'
          />
        </div>
      </div>
    );
  }
}
SmoothProgress.propTypes = {
  value: PropTypes.number.isRequired,
};
