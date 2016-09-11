module.exports = {
  entry: './js/src/HappoApp.jsx',
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  output: {
    path: './lib/happo/public',
    filename: 'HappoApp.bundle.js',
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
