class WasmSocketInputStream
{
    constructor(protocol) {
        this.__protocol = protocol;
    }

    next() {
        return this.__protocol.next();
    }
}


export { WasmSocketInputStream };