customElements.define("app-unsafe-text", class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const attributeName = "data-text";
        if(this.isConnected) {
            let text = "[Une erreur est survenue]";
            try {
                text = atob(this.getAttribute(attributeName));
            } catch(e) {
                console.error(e);
            }
            this.textContent = text;
            this.removeAttribute(attributeName);
        }
    }
});
