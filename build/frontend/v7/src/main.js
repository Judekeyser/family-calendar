import App from './App.svelte'

function reinitializeHistory() {
    const currentUrl = new URLSearchParams(window.location.hash.substring(1));
    window.history.replaceState({
        initial: true,
        urlMap: new Map([...currentUrl])
    }, "", window.location.href);
    window.dispatchEvent(new CustomEvent("app-history-change", { detail: currentUrl }));
}

window.addEventListener("popstate", event => {
    const url = new URLSearchParams();
    if(window.history.state && window.history.state instanceof Map) {
        const urlMap = window.history.state.urlMap;
        for(const [key, value] of urlMap.entries()) {
            url.set(key, value);
        }
        window.dispatchEvent(new CustomEvent("app-history-change", { detail: url }));
    } else {
        reinitializeHistory();
    }
});

window.addEventListener("app-history-change", ({ detail }) => {
    const url = detail;
    const initial = window.history.state?.initial || false;

    effect: {
        const urlMap = new Map(url);
        if(window.history.state && window.history.state.urlMap instanceof Map) {
            const currentUrl = window.history.state.urlMap;
            if(currentUrl.get("path") === url.get("path")) {
                window.history.replaceState({
                    initial: window.history.state.initial,
                    urlMap
                }, "", `#${url.toString()}`);
                break effect;
            }
        }
        window.history.pushState({ urlMap }, "", `#${url.toString()}`);
    }
    window.dispatchEvent(new CustomEvent("app-url-change", { detail: { initial, url } }));
})

window.addEventListener("load", () => {
    new App({
        target: document.body
    });
    reinitializeHistory();
});

