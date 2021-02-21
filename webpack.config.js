const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: "development",
  entry: {
    client: ['./src/client/index.js'],
    field: ['./src/field_iframe/field.js'],
    main: ['./src/main_iframe/main.js'],
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, "src", "field_iframe", "field.html"),
        path.resolve(__dirname, "src", "main_iframe", "main.html"),
      ],
    }),
  ],
};
