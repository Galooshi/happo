import { Platform } from 'react-native';

let stories = [];
let map = {};

const make = (name, Component) => {
  const story = { name, Component };
  stories.push(story);
  map[name] = story;
};
const getStories = () => stories;
const getStory = name => map[name];
const clear = () => { stories = []; map = {}; };

let config = {
  host: Platform.select({
    ios: 'localhost', // ios simulators are same machine
    android: '10.0.3.2', // genymotion VMs
  }),
  port: 5000,
};

const configure = (options) => {
  config = {
    ...config,
    ...options,
  };
};

const getConfig = () => config;

module.exports = {
  make,
  getStories,
  getStory,
  clear,
  configure,
  getConfig,
};
