module.exports = {
  entry: {
    HappoApp: './src/HappoApp.jsx',
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
