import { WasmSocket } from "./wasm/wasm-socket/wasm-socket.js";
import { SeriesDynamicMemory } from "./wasm/wasm-matrix/wasm-series.js";
import { DataframeDynamicMemory } from "./wasm/wasm-matrix/wasm-dataframe.js";
import { WasmRuntime } from "./wasm/wasm-module-loader/wasm-memory.js";


function pushNavigationStateInURL({ url, parameters }) {
    const currentState = history.state;
    const sp = new URLSearchParams();
    for(const [key, value] of Object.entries(parameters)) {
        sp.append(key, value);
    }
    const queryString = `${url}?${sp.toString()}`;
    const hash = `#${btoa(queryString)}`;
    const state = { url, parameters };

    if(currentState && currentState.url === state.url) {
        history.replaceState(state, '', hash);
    } else {
        history.pushState(state, '', hash);
    }
}


function handleHistoryChange({ state, hash }) {
    if(state) {
        window.dispatchEvent(new CustomEvent(
            "app-navigate",
            { detail : state }
        ));
    } else {
        if(hash == null) {
            let nextHash = '';
            try {
                nextHash = atob(location.hash.substring(1));
            } catch(error) {
                console.warn(error);
            }
            return handleHistoryChange({ hash: nextHash });
        } else {
            const url = hash.substring(0, hash.indexOf('?'));
            const parameters = Object.fromEntries(new URLSearchParams(
                hash.substring(url.length+1, hash.length)
            ));
            return handleHistoryChange({ state: { url, parameters } });
        }
    }
}


window.addEventListener("popstate",
    e => void handleHistoryChange({ state: e.state })
);


function* protocol({ url, parameters }) {
    yield `GET ${url}`;
    for(const [key, value] of Object.entries(parameters)) {
        yield `${key}:${value}`;
    }
}


const navigator = {
    __defaultValues: function({ url, parameters }) {
        if(url == 'calendar') {
            /**
             * This route is special, as it should use default
             * parameters from session storage and current today value.
             * 
             * We pach the parameters here.
             */
            let { focus_date, weeks_count } = parameters;

            // Check MDN: Date.now returns a timestamp from epoch.
            // Date constructor from number will agree on this convention.
            // This means that for a belgian user, the iso string might not correspond
            // to today date (because of timezone). We thus extract a local string
            // and recreate the correct datestring.
            const nowDate = new Date(Date.now());
            const localString = nowDate.toLocaleDateString("fr-BE");
            const [day, month, year] = localString.split("/");
            console.log("", day, month, year);
            const today_date = "2023-09-25";


            if(weeks_count) {
                window.sessionStorage.setItem('weeks_count', weeks_count);
            } else {
                weeks_count = window.sessionStorage.getItem('weeks_count') || 5;
            }

            if(focus_date) {
                window.sessionStorage.setItem('focus_date', focus_date);
            } else {
                focus_date = window.sessionStorage.getItem('focus_date') || today_date;
            }

            return {
                focus_date,
                today_date,
                weeks_count
            };
        } else {
            return parameters;
        }
    },
    __handleNavigation: function({ url, parameters }) {
        const patchedParameters = this.__defaultValues({ url, parameters });
        try {
            pushNavigationStateInURL({ url, parameters: patchedParameters });
            this.__renderDocument(protocol({ url, parameters: patchedParameters }));
        } catch(e) {
            console.error(e);
        }
    },
    __renderDocument: undefined
};


const __FAKE_STORE = new Map([
    ["2023-10-01", new Map([
        ["fullday", {unread: true, isDayOff: false, description: "This event is on 01/10, all day", detail: ""}],
        ["10:00", {unread: false, isDayOff: true, description: "This event is on 01/10,-10:00", detail: ""}]
    ])],
    ["2023-09-25", new Map([
        ["15:00", {unread: false, isDayOff: false, description: "This event is on 25/09, 15:00", detail: ""}],
        ["10:37", {unread: false, isDayOff: false, description: "This event is on 25/09, 10:37", detail: ""}]
    ])],
    ["2023-09-19", new Map([
        ["afternoon", {unread: false, isDayOff: true, description: "This event is on 19/09, afternoon", detail: ""}],
        ["10:00", {unread: false, isDayOff: false, description: "This event is on 19/09, 10:00", detail: ""}]
    ])],
    ["2023-09-26", new Map([
        ["15:00", {unread: true, isDayOff: false, description: "This event is on 26/09, 15:00", detail: ""}],
        ["10:00", {unread: false, isDayOff: false, description: "This event is on 26/09, 10:00", detail: ""}]
    ])],
    ["2023-09-01", new Map([
        ["17:23", {unread: true, isDayOff: false, description: "This event is on 01/09, 17:23", detail: ""}],
        ["morning", {unread: false, isDayOff: false, description: "This event is on 01/09, morning", detail: ""}]
    ])]
]);

window.addEventListener("load" /* DOMContentLoaded */, async () => {
    // Create subtype of navigator and let it handle app-navigate events
    const navigatorWithRender = Object.setPrototypeOf({}, navigator);
    window.addEventListener("app-navigate",
        ({ detail }) => void navigatorWithRender.__handleNavigation(detail)
    );

    // Compile WASM module
    const wasmMemory = new WebAssembly.Memory({'initial': 2});
    const memoryBuffer = new Uint8Array(wasmMemory.buffer);
    // Create ambiant runtime
    const seriesDynamicMemory = new SeriesDynamicMemory();
    const dataframeDynamicMemory = new DataframeDynamicMemory(seriesDynamicMemory);

    const runtime = new WasmRuntime(memoryBuffer, seriesDynamicMemory, dataframeDynamicMemory);
    // Fetch and compile module
    const request = await fetch('next-app-module.wasm', { headers: {
        "Accept": "application/wasm"
    }});
    const wasmProgram = await WebAssembly.instantiateStreaming(request, {
        env: {
            memory: wasmMemory,
            ...runtime.imports
        }
    });

    // Get module exports and define a ready-to-work object
    const accept = wasmProgram.instance.exports.accept.bind(wasmProgram.instance.exports);
    const heapBase = wasmProgram.instance.exports.__heap_base;

    // Bind new processor in the navigator object
    navigatorWithRender.__renderDocument = function(protocol) {
        seriesDynamicMemory.clear();
        dataframeDynamicMemory.clear(__FAKE_STORE);

        const tic = Date.now();
        runtime.wasmSocket = new WasmSocket(protocol);

        accept(heapBase, 2048);

        /*
        const cleanedUp = window.DOMPurify.sanitize(runtime.wasmSocket.output, {
            CUSTOM_ELEMENT_HANDLING: {
                // allow all tags starting with "app-"
                tagNameCheck: ((
                    (tagName) => !!tagName.match(/^app-/)
                )), 
                // allow all 
                attributeNameCheck: ((
                    () => true
                )),// allow customized built-ins
                allowCustomizedBuiltInElements: true, 
            }
        });
        */

        document.body.innerHTML = runtime.wasmSocket.output;

        const toc = Date.now();
        console.log("JS perspective, took", toc-tic);
        console.log("Series Dynamic memory", seriesDynamicMemory);
        console.log("Dataframe Dynamic memory", dataframeDynamicMemory);
    };

    /* Sets today date to today, and initializes the view */
    window.dispatchEvent(new CustomEvent(
        "app-navigate",
        { detail : {
            url: 'calendar',
            parameters: {}
        } }
    ));
});


