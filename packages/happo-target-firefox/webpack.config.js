module.exports = {
  entry: {
    HappoRunner: './src/HappoRunner.js',
    HappoDebug: './src/HappoDebug.jsx',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  output: {
    path: './public',
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /cssesc\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
