const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    'payment-profile-tokenizer': ['./src/paymentProfileTokenizer.ts'],
    field: ['./src/field_iframe/field.ts'],
    main: ['./src/main_iframe/main.ts'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, 'src', 'field_iframe', 'field.html'),
        path.resolve(__dirname, 'src', 'main_iframe', 'main.html'),
      ],
    }),
  ],
};
