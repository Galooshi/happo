const path = require('path');

const { platform, arch } = process;

const geckodriverFolder = path.join(__dirname,
  `../../geckodriver/${platform}-${arch}/`);

process.env.PATH += path.delimiter + geckodriverFolder;

module.exports = geckodriverFolder;
