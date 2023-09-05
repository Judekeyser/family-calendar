const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname, 'src', 'templates');
const CODE_DIST_FILE = path.resolve(__dirname, 'dist', 'templateRepository.js');


const queues = new Map();

let clock;
function btoa(str) {
    return Buffer.from(str).toString('base64');
}
async function processFile(filename) {
    const fileContent = (await fs.promises.readFile(
        path.resolve(SOURCE_DIR, filename),
        'utf-8'
    )).replace(/\s+/g, ' ');
    return btoa(encodeURI(fileContent));
}

async function recompile() {
    const templates = await Promise.all(
        [...queues.entries()].map(([key, value]) => value.then(v => ({
            filename: key.substring(0, key.indexOf('.')),
            code: v
        })))
    );
    const filehandle = fs.openSync(CODE_DIST_FILE, 'w');
    try {
        fs.writeSync(filehandle, 'const templateRepository = new Map();\n');
        for await(const {filename, code} of templates) {
            fs.writeSync(filehandle, `templateRepository.set("${filename}", "${code}");\n`);
        }
        fs.writeSync(filehandle, `
        function getTemplate(templateId) {
            const templateContent = templateRepository.get(templateId);
            if(!templateContent) throw "Unknown template for id " + templateId;
            const text = decodeURI(atob(templateContent));
            return text;
        }
        window['getAppTemplate'] = getTemplate;
        `);
    } finally {
        fs.closeSync(filehandle);
    }
    return null;
}

function trigger(filename) {
    if(clock) {
        clearTimeout(clock);
        clock = undefined;
    }
    clock = setTimeout(() => {
        console.log("Actually process and verify checksum");
        if(! queues.has(filename)) {
            queues.set(filename, Promise.resolve());
        }
        queues.set(
            filename,
            queues.get(filename).then(() => processFile(filename))
        );

        recompile();
    }, 100);
}

for(const file of fs.readdirSync(SOURCE_DIR)) {
    const process = processFile(file)
    queues.set(file, process);
};
(async () => {
    await recompile();
    console.log("--- Initial compilation done ---");
    console.log("--- Now watching for changes ---");

    fs.watch(SOURCE_DIR, (event, filename) => {
        if (filename && event ==='change') {
            console.log(`${filename} file Changed`);

            trigger(filename);
        }
    })
})();
