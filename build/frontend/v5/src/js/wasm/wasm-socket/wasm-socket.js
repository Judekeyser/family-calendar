import { WasmSocketInputStream } from './wasm-socket-input-stream'
import { WasmSocketOutputStream } from './wasm-socket-output-stream';


class WasmSocket
{
    #inputStream;
    #outputStream;

    constructor(inputStreamSpecification, outputStreamSpecification) {
        {
            const { preamble, queryParametersIterator } = inputStreamSpecification;
            this.#inputStream = new WasmSocketInputStream(preamble, queryParametersIterator);
        }
        {
            this.#outputStream = new WasmSocketOutputStream();
        }
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
        return this.#outputStream.output;
    }

    rebindInputStream(newInputStream) {
        this.#inputStream = newInputStream;
    }
}


export { WasmSocket };