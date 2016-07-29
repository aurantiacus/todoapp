var DEBUG = !process.argv.includes('--release')

var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var config = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: DEBUG ? 'http://localhost:8080/dist' : null
  },
  resolve: {
    extensions: ['', '.js', '.jsx', 'css', '.less']
  },
  devtool: DEBUG ? '#source-map' : null,
  module: {
    loaders: [
      {
        text: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: { presets: ['es2015', 'react'] }
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        loader: 'style!css!less'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'url-loader?limit=3000&name=[name]-[hash].[ext]'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  externals: {
    'electron': 'require("electron")'
  }
}

module.exports = config
