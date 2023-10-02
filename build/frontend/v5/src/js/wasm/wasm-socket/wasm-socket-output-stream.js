class WasmSocketOutputStream
{
    // Accept lines from WASM to JavaScript
    constructor() {
        this.__lines = [];
        this.__template = "";
    }

    flush() {
        this.__template += this.__lines.join("");
        this.__lines = [];
    }

    accept(templateSlice) {
        if(templateSlice) {
            this.__lines.push(templateSlice);
        }
    }

    get output() {
        this.flush();
        return this.__template;
    }
}


export { WasmSocketOutputStream };