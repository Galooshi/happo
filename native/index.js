// this is needed to support socket.io
window.navigator.userAgent = 'react-native';

const { AppRegistry } = require('react-native');

// this will get called once for side-effects, at require time.
AppRegistry.registerComponent('happo_snapshots', () => require('./Scaffold'));

// the public API for happo will be
module.exports = require('./js/StoryManager');
