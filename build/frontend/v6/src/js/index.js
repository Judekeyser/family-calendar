import { WasmRuntime } from "./wasm/wasm-memory.js";
import { backend } from './backend/backend-store.js';
import { now } from './backend/date-utils.js';


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
            const today_date = now();

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
    __handleNavigation: async function({ url, parameters }) {
        const patchedParameters = this.__defaultValues({ url, parameters });
        try {
            pushNavigationStateInURL({ url, parameters: patchedParameters });
            await this.__renderDocument(protocol({ url, parameters: patchedParameters }));
        } catch(e) {
            console.error(e);
        }
    },
    __renderDocument: undefined
};


window.addEventListener("load" /* DOMContentLoaded */, async () => {
    // Create subtype of navigator and let it handle app-navigate events
    const navigatorWithRender = Object.setPrototypeOf({}, navigator);
    window.addEventListener("app-navigate",
        ({ detail }) => void navigatorWithRender.__handleNavigation(detail)
    );

    // Compile WASM module
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
    console.log(wasmProgram);

    // Bind new processor in the navigator object
    navigatorWithRender.__renderDocument = async function() {
        const tic = Date.now();

        {
            try {
                let _ignored = await backend.state;
                console.log("Backend state", _ignored);
            } catch(error) {
                const { errorCode } = error;
                if(errorCode == 401 || errorCode == 403) {
                    const status = await backend.authentify({
                        password: "kostas",
                        userName: "justin"
                    });
                    console.log(status);
                }
                console.log(error);
            }
        }

        wasmProgram.instance.exports.accept.bind(
            wasmProgram.instance.exports
        )();

        document.body.innerHTML = "<p>No content for now</p>";

        const toc = Date.now();
        console.log("JS perspective, took", toc-tic);
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


