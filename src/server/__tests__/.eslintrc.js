module.exports = {
  env: {
    jasmine: true,
    jest: true,
  },
  rules: {
    'import/no-extraneous-dependencies': [error, { devDependencies: true }],
  },
};
