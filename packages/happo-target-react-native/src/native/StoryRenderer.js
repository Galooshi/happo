import React, { PropTypes } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { takeSnapshot } from 'react-native-view-shot';

const propTypes = {
  name: PropTypes.string.isRequired,
  Component: PropTypes.func.isRequired,
  onSnapshotCompleted: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

class StoryRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.setRef = this.setRef.bind(this);
    this.onLayout = this.onLayout.bind(this);
    const { width } = Dimensions.get('window');
    this.state = {
      width,
    };
  }
  onLayout() {
    takeSnapshot(this.box, {
      format: 'png',
      quality: 1.0,
      result: 'data-uri',
    })
      .then((uri) => {
        this.props.onSnapshotCompleted(this.props.name, uri);
      })
      .catch((err) => {
        console.error(err);
        // TODO(lmr): this shouldn't happen, but we should expose something to user maybe?
      });
  }
  setRef(box) {
    this.box = box;
  }
  render() {
    const { Component } = this.props;
    return (
      <View
        collapsable={false}
        ref={this.setRef}
        onLayout={this.onLayout}
        style={styles.container}
      >
        <Component />
      </View>
    );
  }
}

StoryRenderer.propTypes = propTypes;

module.exports = StoryRenderer;
