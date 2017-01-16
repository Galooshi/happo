import React, { PropTypes } from 'react';

export default class ComponentCacher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keepMounted: props.visible,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === this.props.visible) {
      return; // no change
    }
    this.setState({
      keepMounted: true,
    });
  }

  render() {
    const { visible } = this.props;
    const { keepMounted } = this.state;

    if (!visible && !keepMounted) {
      return null;
    }

    return (
      <div
        style={{
          display: visible ? 'block' : 'none',
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
ComponentCacher.propTypes = {
  children: PropTypes.node.isRequired,
  visible: PropTypes.bool,
};
