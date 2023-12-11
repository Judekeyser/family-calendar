function elementById(base, id) {
    return base.querySelector(`*[data-id=${id}]`);
}
window.navigate = function(url) {
    console.log("Navigatio triggered with", [...url])
    window.dispatchEvent(new CustomEvent("app-url-change", { detail: url }));
}

import computeDocument from "./backend/document";
import orchestrator from "./dom/orchestrator";


window.addEventListener("load", () => {
    const url = new URLSearchParams([
        ["path", "calendar-grid"],
        ["focusdate", "2027-12-31"]
    ]);

    window.addEventListener("app-url-change", ({ detail }) => {
        const url = detail;
        const document = computeDocument(url);
        orchestrator(document);
    });
    navigate(url);
});