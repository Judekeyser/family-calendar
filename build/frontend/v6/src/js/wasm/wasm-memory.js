const decoder = new TextDecoder();
function UTF8ToString(byteArray) {
    let size = 0;
    for(const byte of byteArray) {
        size += 1;
        if(!byte) {break;}
    }
    const slice = byteArray.subarray(0, size-1);
    return decoder.decode(slice);
}

/*
const encoder = new TextEncoder();
function stringToUTF8Slice(jsMessage, buffer) {
    if(jsMessage != null) {
        const slice = encoder.encode(jsMessage);
        const utf8Length = slice.byteLength + 1;
        if(buffer.byteLength >= utf8Length) {
            buffer.set(slice);
            buffer[slice.byteLength] = 0;
            return utf8Length;
        }
    }
    return 0;
}
*/


class WasmRuntime {
    constructor(memoryBuffer) {
        this.__memoryBuffer = memoryBuffer;
        this.__heap_base = null;
    }

    app_throw_error(stringPointer) {
        const startSlice = this.__memoryBuffer.subarray(stringPointer);
        const jsString = UTF8ToString(startSlice);
        throw new WebAssembly.RuntimeError(jsString);
    }

    app_set_heap_base(pointer) {
        this.__heap_base = pointer;
        console.log("JS Runtime; heap_base =", this.__heap_base);
    }

    /*
    write_message(jsString) {
        stringToUTF8Slice(
            jsString,
            this.__memoryBuffer.subarray(40000, 40000+1000)
        );
    }
    */

    get imports() {
        const methods = [
            "app_throw_error",
            "app_set_heap_base"
        ];
        return Object.freeze(Object.fromEntries(methods.map(
            name => ([name, this[name].bind(this)])
        )));
    }
}


export { WasmRuntime };