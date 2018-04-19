var path = require('path');
var webpack = require('webpack');

module.exports = {
	mode: 'development',

	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},

	devtool: 'source-map',
	devServer: {
		contentBase: './dist',
	},

	module: {
		rules: [
		  {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
        options: {
          presets: ['es2015', 'react'],
          plugins: [
            ['import', { libraryName: "antd", style: true }]
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
	}
};