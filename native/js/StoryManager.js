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

module.exports = {
  make,
  getStories,
  getStory,
  clear,
};
