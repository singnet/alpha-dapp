var path = require('path');
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');

var srcPath = path.join(__dirname, '..', 'src');
var outPath = path.join(__dirname, '..', 'dist');

module.exports = {

  entry: path.join(srcPath, 'index.js'),

  output: {
    path: outPath,
    filename: 'bundle.[chunkhash:8].js'
  },

  devtool: 'source-map',
  devServer: {
    contentBase: outPath,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: srcPath,
        exclude: /node_modules/,
        options: {
          presets: [
            ['es2015', { modules: false }], 'react'
          ],
          plugins: [
            ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "less-loader",
          options: {
            javascriptEnabled: true
          }
        }]
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(srcPath, 'index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ]
};
