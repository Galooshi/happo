import React, { Component } from 'react';
import HappoJob from './HappoJob';

class Scaffold extends Component {
  render() {
    return (
      <HappoJob
        serverUrl="http://localhost:5000"
      />
    );
  }
}

module.exports = Scaffold;
