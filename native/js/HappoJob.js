import React, { Component, PropTypes } from 'react';
import {
  View,
} from 'react-native';
import io from 'socket.io-client';
import StoryRenderer from './StoryRenderer';
import { getStories, getStory } from './StoryManager';

const propTypes = {
  serverUrl: PropTypes.string.isRequired,
};

class HappoJob extends Component {
  constructor(props) {
    super(props);
    this.onRenderStory = this.onRenderStory.bind(this);
    this.onSnapshotCompleted = this.onSnapshotCompleted.bind(this);

    this.state = {
      story: null,
    };
  }
  componentDidMount() {
    this.socket = io(this.props.serverUrl, { jsonp: false });
    this.socket.on('renderStory', this.onRenderStory);

    this.socket.emit('stories', getStories().map(s => s.name));
  }
  onRenderStory(name) {
    this.setState({
      story: getStory(name),
    });
  }
  onSnapshotCompleted(name, uri) {
    this.socket.emit('snapshotComplete', { name, uri });
  }
  render() {
    const { story } = this.state;
    return (
      <View style={{ paddingTop: 20 }}>
        {story && (
          <StoryRenderer
            key={story.name}
            name={story.name}
            Component={story.Component}
            onSnapshotCompleted={this.onSnapshotCompleted}
          />
        )}
      </View>
    );
  }
}

HappoJob.propTypes = propTypes;

module.exports = HappoJob;
