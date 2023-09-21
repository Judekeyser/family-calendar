const encoder = new TextEncoder();
const decoder = new TextDecoder();

function UTF8ToString(byteArray) {
    let size = 0;
    for(const byte of byteArray) {
        size += 1;
        if(!byte) break;
    }
    const slice = byteArray.subarray(0, size-1);
    return decoder.decode(slice);
}


class WasmRuntime {
    #memoryBuffer;
    #dynamicMemory;
    #wasmSocket;

    constructor(memoryBuffer, dynamicMemory) {
        this.#memoryBuffer = memoryBuffer;
        this.#dynamicMemory = dynamicMemory;
    }

    set wasmSocket(value) {
        this.#wasmSocket = value;
    }

    get wasmSocket() {
        return this.#wasmSocket;
    }

    app_throw_error = (stringPointer) => {
        const startSlice = this.#memoryBuffer.subarray(stringPointer);
        const jsString = UTF8ToString(startSlice);
        throw new WebAssembly.RuntimeError(jsString);
    }

    app_read_from_socket = (writePtr, maxBytesToWrite) => {
        try {
            const jsMessage = this.wasmSocket.read();
            if(jsMessage != null) {
                const slice = encoder.encode(jsMessage);
                const utf8Length = slice.byteLength + 1;
                if(maxBytesToWrite > utf8Length) {
                    this.#memoryBuffer.subarray(writePtr, writePtr+maxBytesToWrite).set(slice);
                    this.#memoryBuffer[writePtr+slice.byteLength] = 0;
                    return utf8Length;
                }
            }
        } catch(error) {console.error(error)}
        return 0;
    }

    app_write_to_socket = (readPtr) => {
        try {
            const startSlice = this.#memoryBuffer.subarray(readPtr);
            const jsString = UTF8ToString(startSlice);
            this.wasmSocket.write(jsString);
            return 1;
        } catch(error) {console.error(error);}
        return 0;
    }

    /** SERIES */

    app_series_create = () => {
        try {
            return this.#dynamicMemory.createEmptySeries();
        } catch(error) {console.error(error)}
        return 0;
    }

    app_series_dispose = (seriesPtr) => {
        try {
            this.#dynamicMemory.disposeSeries(seriesPtr);
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_get_as_int = (seriesPtr, index) => {
        try {
            const series = this.#dynamicMemory.getSeries(seriesPtr);
            return series.get(index);
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_set_int = (seriesPtr, index, value) => {
        try {
            const series = this.#dynamicMemory.getSeries(seriesPtr);
            series.set(index, value);
        } catch(error) {console.error(error);}
    }

    app_series_push_int = (seriesPtr, value) => {
        try {
            const series = this.#dynamicMemory.getSeries(seriesPtr);
            series.push(value);
        } catch(error) {console.error(error);}
        return 0;
    }

    app_series_size = (seriesPtr) => {
        try {
            const series = this.#dynamicMemory.getSeries(seriesPtr);
            return series.size;
        } catch(error) {console.error(error);}
        return -1;
    }

    get imports() {
        const methods = [
            "app_throw_error",
            "app_read_from_socket",
            "app_write_to_socket",
            "app_series_create",
            "app_series_dispose",
            "app_series_get_as_int",
            "app_series_set_int",
            "app_series_push_int",
            "app_series_size"
        ];
        return Object.freeze(Object.fromEntries(methods.map(
            methodName => ([methodName, this[methodName]])
        )));
    }
}


export { WasmRuntime };