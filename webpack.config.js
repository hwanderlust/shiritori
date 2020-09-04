const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: "development",
  entry: './src/scripts/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: "source-map",
  devServer: {
    contentBase: "./dist",
    open: true
  },
  resolve: {
    extensions: [".ts", ".js"] // If multiple files share the same name but have different extensions, webpack will resolve the one with the extension listed first in the array and skip the rest.
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          publicPath: 'assets', // Reference location (doesn't work when only using 'outputPath')
          outputPath: 'assets', // Export location
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      { test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader', // Creates `style` nodes from JS strings
          'css-loader', // Translates CSS into CommonJS
          'sass-loader', // Compiles Sass to CSS
        ],
      },
    ]
  },
  plugins: [new HtmlWebpackPlugin({ template: "./public/index.html" })]
};