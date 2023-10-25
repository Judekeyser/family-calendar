const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');


module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, '..', '..', 'src', 'js', 'main.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', '..', 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        sourceMap: false,
        mangle: {
          properties: {
            regex: /^__?\w+/
          }
        },
        toplevel: true,
        compress: true
      }
    })],
  },
  plugins: [new ESLintPlugin()],
  devServer: {
    static: path.resolve(__dirname, '..', '..', 'dist'),
    compress: true,
    port: 5000,
    proxy: {
      '/send_event.php': 'http://localhost:8000/send_event.php',
    },
  }
};