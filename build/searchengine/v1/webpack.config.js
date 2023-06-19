const path = require('path');


module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'searchengine.js'),
  output: {
    filename: 'searchengine.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 5000,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    }
  },
};