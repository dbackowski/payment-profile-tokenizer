const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: "development",
  entry: {
    client: ['./src/client/index.js'],
    field: ['./src/server/field.js'],
    main: ['./src/server/main.js'],
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
        path.resolve(__dirname, "src", "server", "field.html"),
        path.resolve(__dirname, "src", "server", "main.html"),
      ],
    }),
  ],
};
