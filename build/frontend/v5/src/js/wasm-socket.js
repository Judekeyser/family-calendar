class WasmSocketInputStream
{
    // Stream from JavaScript to WASM
    #lineIterator;

    constructor(lineIterator) {
        this.#lineIterator = lineIterator;
    }

    next = () => this.#lineIterator.next();
}

class WasmSocketOutputStream
{
    // Accept lines from WASM to JavaScript
    #lines;

    constructor() {
        this.#lines = []
    }

    accept = someLine => void this.#lines.push(someLine);

    get lines() {
        return [...this.#lines];
    }
}


class WasmSocket
{
    #inputStream;
    #outputStream;

    constructor(inputLineIterator) {
        this.#inputStream = new WasmSocketInputStream(inputLineIterator);
        this.#outputStream = new WasmSocketOutputStream();
    }
    
    read = () => {
        const { done, value } = this.#inputStream.next();
        if(done) {
            return null;
        } else {
            return value;
        }
    }

    write = someLine => void this.#outputStream.accept(someLine);

    get output() {
        return this.#outputStream.lines;
    }

    static makeInputStream(preamble, queryParameters) {
        return {
            preamble,
            qpIterator: queryParameters[Symbol.iterator](),
            next: function() {
                if(this.preamble) {
                    const preamble = this.preamble;
                    delete this.preamble;
                    return {
                        done: false,
                        value: preamble
                    };
                } else {
                    const { done, value } = this.qpIterator.next();
                    console.log("emitting");
                    if(done) {
                        return { done, value };
                    } else {
                        const {key, parameter} = value;
                        return {
                            done: false,
                            value: `${key}:${parameter}`
                        };
                    }
                }
            }
        };
    }
}


export { WasmSocket };