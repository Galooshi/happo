const setupServerAndWaitForSnapshots = require('./setupServerAndWaitForSnapshots');
const initializeDriver = require('./initializeDriver');
const initializePackager = require('./initializePackager');
const runVisualDiffs = require('./runVisualDiffs');
const defaultOptions = require('./defaultOptions');

class ReactNativeTarget {
  constructor(passedOptions) {
    this.options = defaultOptions(passedOptions);
    this.name = this.options.name;
  }

  debug() {
    return setupServerAndWaitForSnapshots({
      options: this.options,
      initializeDriver: () => initializeDriver(this.options),
      initializePackager: () => initializePackager(this.options).then(() => {
        console.log('Server started');
      }),
    });
  }

  run() {
    return setupServerAndWaitForSnapshots({
      options: this.options,
      initializeDriver: () => initializeDriver(this.options),
      initializePackager: () => initializePackager(this.options),
    }).then(snapshots => runVisualDiffs(snapshots, this.options));
  }
}

module.exports = ReactNativeTarget;
