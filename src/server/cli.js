const commander = require('commander');

const constructUrl = require('./constructUrl');
const runVisualDiffs = require('./runVisualDiffs');
const server = require('./server');
const uploadLastResult = require('./uploadLastResult');

function logAndExit(error) {
  console.error(error);
  process.exit(1);
}

commander.command('debug').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/debug')}`);
  });
});

commander.command('run').action(() => {
  server.start().then(() => {
    runVisualDiffs()
      .then(() => process.exit(0))
      .catch(logAndExit);
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

commander.command('upload [<triggeredByUrl>]').action((triggeredByUrl) => {
  uploadLastResult(triggeredByUrl)
    .then(url => console.log(url))
    .catch(logAndExit);
});

module.exports = function cli(argv) {
  commander.parse(argv);
  if (!argv.slice(2).length) {
    commander.outputHelp();
  }
};
