import { WasmSocket } from "./wasm-socket";

window['__APP_WASM_SOCKET__'] = null;


window.addEventListener("load", async function() {
    console.log("Main JS is loaded");
    const module = await window.whenAppModuleReady();

    function* fakeRequest() {
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

    const socket = new WasmSocket(
        WasmSocket.makeInputStream("GET calendar", fakeRequest())
    );

    window['__APP_WASM_SOCKET__'] = socket;

    module._accept();

    console.log(socket.output);
});

