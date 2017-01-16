function fail(message) {
  /* eslint-disable no-console */
  console.error('Happo config validation failed:');
  console.error(message);
  process.exit(1);
}

function validateConfig(config) {
  if (!config) {
    fail('no config found');
  }

  const { targets } = config;
  if (targets && !Array.isArray(targets)) {
    fail(`Expected \`targets\` to be an array. Found ${typeof targets} instead.`);
  }

  const nameSet = Object.create(null);

  targets.forEach((target, index) => {
    if (!target) {
      fail(`Target must be an object. Found ${typeof target} at index ${index} instead.`);
    }
    if (!target.name) {
      fail(`Target at index ${index} did not have a \`name\`.`);
    }
    if (target.name in nameSet) {
      fail(`Multiple targets found with name '${target.name}'. Name must be unique.`);
    }
    nameSet[target.name] = true;
    if (typeof target.run !== 'function') {
      fail(`Target ${target.name} did not have a \`run\` method.`);
    }
    if (typeof target.debug !== 'function') {
      fail(`Target ${target.name} did not have a \`debug\` method.`);
    }
  });

  return config;
}

module.exports = validateConfig;
