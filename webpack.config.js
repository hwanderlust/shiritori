const path = require('path');

module.exports = {
  mode: "development",
  entry: './src/scripts/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      { test: /\.js$/, loader: "source-map-loader" }
    ]
  }
};