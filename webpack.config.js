module.exports = {
  entry: {
    HappoApp: './js/src/HappoApp.jsx',
    HappoRunner: './js/src/HappoRunner.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  output: {
    path: './lib/happo/public',
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
