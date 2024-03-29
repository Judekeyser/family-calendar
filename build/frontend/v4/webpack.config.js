const path = require('path');
const child_process = require('child_process');


module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'js', 'main.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 5000,
    proxy: {
      '/send_event.php': 'http://localhost:8000/send_event.php',
    },
  }
};