const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const createIndexHtml = new HtmlWebpackPlugin()
const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dst')
  },
  module: {
    rules: [
      {
        test: /\.js$|\.jsx$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: [
              [require('babel-plugin-transform-react-jsx'), { 'pragma': 'h' }],
              require('babel-plugin-transform-class-properties')
            ],
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.sass/,
        use: extractSass.extract({
          use: [
            { loader: 'css-loader', options: { modules: true } },
            { loader: 'sass-loader' }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      }
    ]
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },
  plugins: [createIndexHtml, extractSass]
}
