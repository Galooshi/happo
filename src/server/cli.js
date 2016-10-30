const commander = require('commander');

const server = require('./server');

commander.command('debug').action(() => {
  server.start().then(({ port }) => {
    console.log(`=> http://localhost:${port}/debug`);
  });
});

commander.command('run').action(() => {
  throw new Error('not yet implemented');
});

commander.command('review').action(() => {
  throw new Error('not yet implemented');
});

commander.command('review-demo').action(() => {
  server.start().then(({ port }) => {
    console.log(`=> http://localhost:${port}/review-demo`);
  });
});

commander.command('upload-diffs').action(() => {
  throw new Error('not yet implemented');
});

module.exports = function cli(argv) {
  commander.parse(argv);
};
