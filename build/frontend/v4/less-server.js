const less = require('less');
const fs = require('fs');
const path = require('path');

const LESS_SOURCE_FILE = path.resolve(__dirname, 'src', 'less', 'app.less');
const LESS_DIST_FILE = path.resolve(__dirname, 'dist', 'app.css');


let queue = Promise.resolve();

let clock;
async function processFile(filename) {
    const fileContent = await fs.promises.readFile(filename, 'utf-8');
    const renderResult = await less.render(fileContent);
    return await fs.promises.writeFile(LESS_DIST_FILE, renderResult.css);
}

fs.watch(LESS_SOURCE_FILE, (event, filename) => {
    if (filename && event ==='change') {
        console.log(`${filename} file Changed`);

        if(clock) {
            clearTimeout(clock);
            clock = undefined;
        }
        clock = setTimeout(() => {
            console.log("Actually process and verify checksum");
            queue = queue.then(() => processFile(LESS_SOURCE_FILE));
        }, 100);
    }
});

