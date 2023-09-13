/**
 * https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-call-javascript-from-native
 */

mergeInto(LibraryManager.library, {
    app_read_from_socket: function(writePtr, maxBytesToWrite) {
        try {
            const wasmSocket = window['__APP_WASM_SOCKET__'];
            if(wasmSocket) {
                const jsMessage = wasmSocket.read();
                if(jsMessage != null) {
                    const utf8Length = lengthBytesUTF8(jsMessage) + 1;
                    if(maxBytesToWrite > utf8Length) {
                        stringToUTF8(jsMessage, writePtr, maxBytesToWrite);
                        return utf8Length;
                    }
                } 
            }
        } catch(error) {}
        return 0;
    },

    app_write_to_socket: function(readPtr) {
        try {
            const wasmSocket = window['__APP_WASM_SOCKET__'];
            if(wasmSocket) {
                const jsString = UTF8ToString(readPtr);
                if(jsString != null) {
                    wasmSocket.write(jsString);
                    return 1;
                }
            }
        } catch(error) {}
        return 0;
    }
});
