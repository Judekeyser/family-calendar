class HTMLComponent extends HTMLElement {
    constructor() {
        super();
    }
}

function define(name, componentClass) {
    customElements.define(name, componentClass);
}

function createElement(name) {
    return document.createElement(name);
}


export { HTMLComponent, define, createElement }