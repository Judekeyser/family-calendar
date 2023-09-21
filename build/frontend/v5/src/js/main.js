import { WasmSocket } from "./wasm/wasm-socket/wasm-socket";
import { DynamicMemory } from "./wasm/wasm-matrix/wasm-series";
import { WasmRuntime } from "./wasm/wasm-module-loader/wasm-memory";


window.addEventListener("load", async function() {
    console.log("Main JS is loaded");
    
    // Define WASM memory
    const wasmMemory = new WebAssembly.Memory({'initial':2});
    const memoryBuffer = new Uint8Array(wasmMemory.buffer);

    // Create ambiant runtime
    const runtime = new WasmRuntime(memoryBuffer, new DynamicMemory());

    // Fetch and compile module
    const request = await fetch('next-app-module.wasm');
    const wasmProgram = await WebAssembly.instantiateStreaming(request, {
        env: {
            memory: wasmMemory,
            ...runtime.imports
        }
    });

    // Get module exports and define a ready-to-work object
    console.log(wasmProgram);
    const accept = wasmProgram.instance.exports.accept.bind(wasmProgram.instance.exports);
    const heapBase = wasmProgram.instance.exports.__heap_base;

    const syncFetch = (preamble, queryParametersIterator) => {
        runtime.wasmSocket = new WasmSocket({ preamble, queryParametersIterator });
        accept(heapBase, 1024);
        return runtime.wasmSocket.output;
    };

    // Example

    function* queryParameters() {
        yield {
            key: "today_date",
            parameter: "2023-09-07"
        };
        yield {
            key: "weeks_count",
            parameter: "3"
        };
        yield {
            key: "focus_date",
            parameter: "2023-09-20"
        };
    }
    const tic = Date.now();
    const { template, effectPlayer } = syncFetch("GET calendar", queryParameters());
    const toc = Date.now();
    document.write("**", template);
    effectPlayer(document.body);
    console.log("JS perspective, took", toc-tic);
});

