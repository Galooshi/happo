const commander = require('commander');

const constructUrl = require('./constructUrl');
const runVisualDiffs = require('./runVisualDiffs');
const server = require('./server');

commander.command('debug').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/debug')}`);
  });
});

commander.command('run').action(() => {
  server.start().then(() => {
    runVisualDiffs()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });
});

commander.command('review').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/review')}`);
  });
});

commander.command('review-demo').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/review-demo')}`);
  });
});

commander.command('upload-diffs').action(() => {
  throw new Error('not yet implemented');
});

module.exports = function cli(argv) {
  commander.parse(argv);
  if (!argv.slice(2).length) {
    commander.outputHelp();
  }
};
