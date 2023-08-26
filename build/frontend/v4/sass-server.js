const sass = require('sass');
const fs = require('fs');
const path = require('path');

const LESS_SOURCE_FILE = path.resolve(__dirname, 'src', 'sass', 'app.sass');
const LESS_DIST_FILE = path.resolve(__dirname, 'dist', 'app.css');


let queue = Promise.resolve();

let clock;
async function processFile(filename) {
    const fileContent = await fs.promises.readFile(filename, 'utf-8');
    const renderResult = await sass.compileStringAsync(fileContent, {
        style: 'compressed'
    });
    return await fs.promises.writeFile(LESS_DIST_FILE, renderResult.css);
}

function trigger() {
    if(clock) {
        clearTimeout(clock);
        clock = undefined;
    }
    clock = setTimeout(() => {
        console.log("Actually process and verify checksum");
        queue = queue.then(() => processFile(LESS_SOURCE_FILE));
    }, 100);
}

trigger();
fs.watch(LESS_SOURCE_FILE, (event, filename) => {
    if (filename && event ==='change') {
        console.log(`${filename} file Changed`);

        trigger();
    }
});
