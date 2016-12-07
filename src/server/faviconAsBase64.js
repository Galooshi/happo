const fs = require('fs');
const path = require('path');

const base64 = new Buffer(
  fs.readFileSync(path.join(__dirname,
    '../../public/favicon.ico')),
).toString('base64');

module.exports = `data:image/ico;base64,${base64}`;
