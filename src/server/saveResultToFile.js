function saveResultToFile(runResult) {
  return new Promise((resolve, reject) => {
    const resultToSerialize = Object.assign({
      generatedAt: Date.now(),
    }, runResult);

    const pathToFile = path.join(
      config.snapshotsFolder, config.resultSummaryFilename);

    fs.writeFile(pathToFile, JSON.stringify(resultToSerialize), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(resultToSerialize);
      }
    });
  });
}
