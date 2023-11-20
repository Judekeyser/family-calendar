import { WasmState } from "./wasm-state"

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

const encoder = new TextEncoder();
function stringToUTF8Slice(jsMessage, buffer) {
    if(buffer.byteLength && jsMessage != null) {
        const slice = encoder.encode(jsMessage);
        const utf8Length = slice.byteLength + 1;
        if(buffer.byteLength >= utf8Length) {
            buffer.set(slice);
            buffer[slice.byteLength] = 0;
            return utf8Length;
        }
    }
    buffer[0] = 0;
    return 0;
}


class WasmRuntime {
    constructor(memoryBuffer, backend) {
        this.__memoryBuffer = memoryBuffer;
        this.__backend = backend;

        this.__resumePoint = undefined;
        this.__enterPoint = undefined;

        this.__backendState = new WasmState();
    }

    app_throw_error(stringPointer) {
        const jsString = this.jsStringFromPointer(stringPointer);
        throw new WebAssembly.RuntimeError(jsString);
    }

    app_log(stringPointer) {
        try {
            const jsString = this.jsStringFromPointer(stringPointer);
            console.log(jsString);
        } catch(error) {
            console.error(error);
        }
    }

    app_get_env(varName, buffer, capacity) {
        try {
            const jsVarName = this.jsStringFromPointer(varName);
            const envValue = (() => {
                switch(jsVarName) {
                    case "url": return window.location.hash.substring(1);
                    case "today": {
                        // Check MDN: Date.now returns a timestamp from epoch.
                        // Date constructor from number will agree on this convention.
                        // This means that for a belgian user, the iso string might not correspond
                        // to today date (because of timezone). We thus extract a local string
                        // and recreate the correct datestring.
                        const nowDate = new Date(Date.now());
                        const localString = nowDate.toLocaleDateString("fr-BE");
                        const [day, month, year] = localString.split("/");
                        const date = [year, month, day].join('-');
                        return date;
                    }
                    case "userName": return window.localStorage.getItem("userName");
                    case "weeksCount":
                    case "focusDate": return window.sessionStorage.getItem(jsVarName);
                }
            })() || "";
            this.writeJsStringToPointer(envValue, buffer, capacity);
        } catch(error) {
            console.error(error);
            this.writeJsStringToPointer("", buffer, capacity);
        }
    }

    app_set_env(varName, value) {
        try {
            const jsVarName = this.jsStringFromPointer(varName);
            const jsValue = this.jsStringFromPointer(value);

            switch(jsVarName) {
                case "url": {
                    console.log("Trying to set URL", jsValue);
                } break;
                case "userName": {
                    console.log("Trying to set user name", jsValue);
                } break;
                case "focusDate": {
                    console.log("Trying to set focus date", jsValue);
                } break;
                case "weeksCount": {
                    console.log("Trying to set weeks count", jsValue);
                } break;
                default: {
                    console.warn("Cannot set read-only or non existing environment variable", jsVarName);
                }
            }
        } catch(error) {
            console.error(error);
        }
    }

    /** Setters */

    set enter(value) {
        this.__enterPoint = value;
    }

    get enter() {
        return this.__enterPoint;
    }

    prepare() {
        return this.__backendState.prepare_view()
    }

    writeJsStringToPointer(jsString, pointer, max) {
        stringToUTF8Slice(
            jsString,
            this.__memoryBuffer.subarray(pointer, pointer+max)
        );
    }

    jsStringFromPointer(stringPointer) {
        const startSlice = this.__memoryBuffer.subarray(stringPointer);
        const jsString = UTF8ToString(startSlice);
        return jsString;
    }

    get imports() {
        const methods = [
            "app_throw_error",
            "app_log",
            "app_get_env",
            "app_set_env"
        ];
        return Object.freeze(Object.fromEntries(methods.map(
            name => ([name, this[name].bind(this)])
        )));
    }
}


async function createRuntime() {
    const wasmMemory = new WebAssembly.Memory({'initial': 5});
    const memoryBuffer = new Uint8Array(wasmMemory.buffer);

    const runtime = new WasmRuntime(memoryBuffer);
    // Fetch and compile module
    const request = await fetch('app-module.wasm', { headers: {
        "Accept": "application/wasm"
    }});
    const wasmProgram = await WebAssembly.instantiateStreaming(request, {
        env: {
            memory: wasmMemory,
            ...runtime.imports
        }
    });

    const moduleEntryPoint = wasmProgram.instance.exports.accept.bind(wasmProgram.instance.exports);

    runtime.enter = moduleEntryPoint;
    return runtime;
}


export { createRuntime };