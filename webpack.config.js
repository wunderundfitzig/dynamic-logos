const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const createIndexHtml = new HtmlWebpackPlugin()
const copyAssets = new CopyWebpackPlugin([
  { from: 'src/assets/img', to: 'img' },
  { from: 'src/assets/staticImages', to: 'staticImages' }
])
const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = {
  entry: ['babel-polyfill', './src/main.js'],
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
              require('babel-plugin-transform-class-properties'),
              require('babel-plugin-transform-object-rest-spread')
            ],
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.sass/,
        use: extractSass.extract({
          use: [
            { loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 2,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            },
            { loader: 'postcss-loader',
              options: {
                plugins: [
                  require('postcss-input-range'),
                  require('autoprefixer')
                ]
              }
            },
            { loader: 'sass-loader' }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },
  plugins: [createIndexHtml, extractSass, copyAssets]
}
