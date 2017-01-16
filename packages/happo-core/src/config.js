let current = null;

module.exports = {
  get: () => current,
  set: (config) => {
    if (current) {
      throw new Error('Cannot set happo config once it has been set!');
    }
    current = config;
  },
  __setForTestingOnly: (config) => {
    current = config;
  },
};
