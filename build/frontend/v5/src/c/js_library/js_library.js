/**
 * https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-call-javascript-from-native
 */

mergeInto(LibraryManager.library, {
    app_throw_error: function(stringPointer) {
        const jsString = UTF8ToString(stringPointer);
        throw new WebAssembly.RuntimeError(jsString);
    },
    app_read_from_socket__deps: ['$UTF8ToString'],

    app_read_from_socket: function(writePtr, maxBytesToWrite) {
        try {
            const wasmSocket = window['__APP_WASM_SOCKET__'];
            const jsMessage = wasmSocket.read();
            if(jsMessage != null) {
                const utf8Length = lengthBytesUTF8(jsMessage) + 1;
                if(maxBytesToWrite > utf8Length) {
                    stringToUTF8(jsMessage, writePtr, maxBytesToWrite);
                    return utf8Length;
                }
            }
        } catch(error) {}
        return 0;
    },
    app_read_from_socket__deps: ['$lengthBytesUTF8', '$stringToUTF8'],

    app_write_to_socket: function(readPtr) {
        try {
            const wasmSocket = window['__APP_WASM_SOCKET__'];
            const jsString = UTF8ToString(readPtr);
            if(jsString != null) {
                wasmSocket.write(jsString);
                return 1;
            }
        } catch(error) {}
        return 0;
    },
    app_write_to_socket__deps: ['$UTF8ToString'],

    /** SERIES */

    app_series_create: function() {
        try {
            const dynamicMemory = window['__APP_DYNAMIC_MEMORY__'];
            return dynamicMemory.createEmptySeries();
        } catch(error) {console.error(error)}
        return 0;
    },

    app_series_dispose: function(seriesPtr) {
        try {
            const dynamicMemory = window['__APP_DYNAMIC_MEMORY__'];
            dynamicMemory.disposeSeries(seriesPtr);
        } catch(error) {}
    },

    app_series_get_as_int: function(seriesPtr, index) {
        try {
            const dynamicMemory = window['__APP_DYNAMIC_MEMORY__'];
            const series = dynamicMemory.getSeries(seriesPtr);
            return series.get(index);
        } catch(error) {}
        return 0;
    },

    app_series_set_int: function(seriesPtr, index, value) {
        try {
            const dynamicMemory = window['__APP_DYNAMIC_MEMORY__'];
            const series = dynamicMemory.getSeries(seriesPtr);
            series.set(index, value);
        } catch(error) {}
    },

    app_series_push_int: function(seriesPtr, value) {
        try {
            const dynamicMemory = window['__APP_DYNAMIC_MEMORY__'];
            const series = dynamicMemory.getSeries(seriesPtr);
            series.push(value);
        } catch(error) {}
    },

    app_series_size: function(seriesPtr) {
        try {
            const dynamicMemory = window['__APP_DYNAMIC_MEMORY__'];
            const series = dynamicMemory.getSeries(seriesPtr);
            return series.size;
        } catch(error) {}
        return -1;
    }
});
