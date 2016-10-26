function isNodeFile(file) {
  return file.indexOf('src/server') !== -1;
}
module.exports = {
  environments: function({ pathToCurrentFile }) {
    if (isNodeFile(pathToCurrentFile)) {
      return ['node'];
    }
    return [];
  },
  declarationKeyword: function({ pathToCurrentFile }) {
    if (isNodeFile(pathToCurrentFile)) {
      return 'const';
    }
    return 'import';
  },
  namedExports: {
    'react': ['PropTypes'],
    'js/src/Diff': [
      'DiffController',
    ]
  },
};
