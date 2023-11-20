import { createRuntime } from "./wasm/wasm-memory.js";
import { backend } from "./backend/backend-store.js"


function pushNavigationStateInURL({ url }) {
    const currentUrl = history.state;
    const hash = `#${url}`;

    if(currentUrl && currentUrl == url) {
        history.replaceState(url, '', hash);
    } else {
        history.pushState(url, '', hash);
    }
}


function handleHistoryChange({ url }) {
    const effectiveUrl = url || location.hash.substring(1) || "";
    window.dispatchEvent(new CustomEvent(
        "app-navigate",
        { detail : { url: effectiveUrl } }
    ));
}


window.addEventListener("popstate",
    e => void handleHistoryChange({ url: e.state })
);


const navigator = {
    __handleNavigation: async function({ url }) {
        try {
            pushNavigationStateInURL({ url });
            await this.__renderDocument();
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
    const runtime = await createRuntime();

    // Bind new processor in the navigator object
    navigatorWithRender.__renderDocument = async function() {
        const tic = Date.now();

        await backend.authentify({
            userName: "justin",
            password: "kostas"
        });
        runtime.enter();
        document.body.innerHTML = "<p>No content for now</p>";

        const toc = Date.now();
        console.log("JS perspective, took", toc-tic);
    };

    /* Sets today date to today, and initializes the view */
    window.dispatchEvent(new CustomEvent(
        "app-navigate",
        { detail : {
            url: "calendar?focus=2023-09-11"
        } }
    ));
});


