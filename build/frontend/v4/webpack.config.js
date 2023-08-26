const path = require('path');
const child_process = require('child_process');


module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'js', 'main.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    //compress: true,
    port: 5000,
    proxy: {
      '/send_event.php': 'http://localhost:8000/send_event.php',
    },
  },
  
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          child_process.exec('npx lessc src/less/app.less dist/app.css', (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      }
    }
  ]
};