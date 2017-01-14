const fs = require('fs');
const getImageFromStream = require('./getImageFromStream');

function getImageFromPath(fpath) {
  return getImageFromStream(fs.createReadStream(fpath));
}

module.exports = getImageFromPath;
