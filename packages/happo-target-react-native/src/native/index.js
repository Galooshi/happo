// this is needed to support socket.io, and needs to get called _before_ socket.io gets required
window.navigator.userAgent = 'react-native';

const { AppRegistry } = require('react-native');

// this will get called once for side-effects, at require time.
// eslint-disable-next-line global-require
AppRegistry.registerComponent('HappoRunner', () => require('./Scaffold'));

// the public API for happo will be
module.exports = require('./StoryManager');
