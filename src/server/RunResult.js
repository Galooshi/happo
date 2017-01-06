class RunResult {
  constructor() {
    this.newImages = [];
    this.diffImages = [];
  }

  add({
    result,
    description,
    height,
    viewportName,
  }) {
    if (result === 'equal') {
      return;
    }
    this[`${result}Images`].push({
      description,
      height,
      viewportName,
    });
  }

  merge(runResult) {
    this.newImages.push(...runResult.newImages);
    this.diffImages.push(...runResult.diffImages);
  }
}

module.exports = RunResult;
