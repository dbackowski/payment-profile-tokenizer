const path = require("path");

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
};
