import { WasmSocketInputStream } from './wasm-socket-input-stream.js';
import { WasmSocketOutputStream } from './wasm-socket-output-stream.js';


class WasmSocket
{
    __inputStream;
    __outputStream;
    
    constructor(inputStreamSpecification) {
        this.__inputStream = new WasmSocketInputStream(inputStreamSpecification);
        this.__outputStream = new WasmSocketOutputStream();
    }
    
    read() {
        const { done, value } = this.__inputStream.next();
        if(done) {
            return null;
        } else {
            return value;
        }
    }

    write(someLine) {
        this.__outputStream.accept(someLine);
    }

    get output() {
        return this.__outputStream.output;
    }
}


export { WasmSocket };