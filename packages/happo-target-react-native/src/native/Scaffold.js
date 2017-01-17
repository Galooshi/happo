import React, { Component } from 'react';
import HappoJob from './HappoJob';
import StoryManager from './StoryManager';

class Scaffold extends Component {
  render() {
    const config = StoryManager.getConfig();
    const url = `http://${config.host}:${config.port}`;
    return (
      <HappoJob serverUrl={url} />
    );
  }
}

module.exports = Scaffold;
