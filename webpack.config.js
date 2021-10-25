const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ['./src/scripts/index.js', './src/styles/index.scss'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].css',
						}
					},
					{
						loader: 'extract-loader'
					},
					{
						loader: 'css-loader?-url'
					},
					{
						loader: 'postcss-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			}
		]
	},
  	plugins: [
		new CopyWebpackPlugin({
		patterns: [
			{ from: "./src/breathing478.html" },
			{ from: "./src/manifest.json" },
			{ from: "icons/*", to: path.resolve(__dirname, "dist"), context: "src/" },
			{ from: "fonts/*", to: path.resolve(__dirname, "dist"), context: "src/" }
		]
		}),
	]
};
