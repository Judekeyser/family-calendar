const { compile } = require('./template-engine');

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname, '..', 'src', 'templates');
const C_CODE_DIR = path.resolve(__dirname, '..', 'src', 'c', 'templates');
const JS_CODE_DIR = path.resolve(__dirname, '..', 'src', 'js', 'templates');


const queues = new Map();

let clock;

async function processFile(templateName) {
    const fileContent = (await fs.promises.readFile(
        path.resolve(SOURCE_DIR, templateName+'.htm'),
        'utf-8'
    )).replace(/\s+/g, ' ');
    
    const compilationResult = compile(templateName, fileContent);
    return compilationResult;
}

async function recompile() {
    console.log(queues);

    for(const [templateName, laterCompilationResult] of queues.entries()) {
        const clines = await laterCompilationResult;

        {
            const filehandle = fs.openSync(path.resolve(C_CODE_DIR, templateName+'.template.h'), 'w');
            try {
                fs.writeSync(filehandle, clines);
            } finally {
                fs.closeSync(filehandle);
            }
        }
    }
}

function trigger(filename) {
    if(clock) {
        clearTimeout(clock);
        clock = undefined;
    }
    const templateName = filename.substring(0, filename.indexOf('.'));
    clock = setTimeout(() => {
        console.log("Actually process and verify checksum");
        if(! queues.has(templateName)) {
            queues.set(templateName, Promise.resolve());
        }
        queues.set(
            templateName,
            queues.get(templateName).then(() => processFile(templateName))
        );

        recompile();
    }, 100);
}

for(const file of fs.readdirSync(SOURCE_DIR)) {
    const templateName = file.substring(0, file.indexOf('.'));
    const process = processFile(templateName);
    queues.set(templateName, process);
};
(async () => {
    await recompile(); return;

    console.log("--- Initial compilation done ---");
    console.log("--- Now watching for changes ---");

    fs.watch(SOURCE_DIR, (event, filename) => {
        if (filename && event ==='change') {
            console.log(`${filename} file Changed`);

            trigger(filename);
        }
    })
})();