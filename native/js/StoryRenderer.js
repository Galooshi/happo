import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { takeSnapshot } from 'react-native-view-shot';

const propTypes = {
  name: PropTypes.string.isRequired,
  Component: PropTypes.func.isRequired,
  onSnapshotCompleted: PropTypes.func.isRequired,
};

class StoryRenderer extends Component {
  constructor(props) {
    super(props);
    this.setRef = this.setRef.bind(this);
    this.onLayout = this.onLayout.bind(this);
  }
  setRef(box) {
    this.box = box;
  }
  onLayout() {
    takeSnapshot(this.box, {
      format: 'png',
      quality: 1.0,
      result: 'file',
    })
      .then(uri => {
        this.props.onSnapshotCompleted(this.props.name, uri);
      })
      .catch(err => {
        console.log('error', err);
        // TODO(lmr):
      });
  }
  render() {
    const { Component } = this.props;
    return (
      <View ref={this.setRef} onLayout={this.onLayout} style={styles.container}>
        <Component />
      </View>
    );
  }
}

StoryRenderer.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

module.exports = StoryRenderer;
