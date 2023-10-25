customElements.define("app-form-value-to-data", class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if(this.isConnected) {
            const dispatchEvent = formData => {
                const event = new FormDataEvent("formdata", { formData });
                this.dispatchEvent(event);
            };

            const dataOn = this.getAttribute("data-on") || "change";
            const source = this.firstElementChild;

            switch(source.tagName.toUpperCase()) {
                case "INPUT": {
                    source.addEventListener(dataOn, function() {
                        const formData = new FormData();
                        formData.set(this.name, String(this.value));
                        dispatchEvent(formData);
                    });
                } break;
            }
        }
    }
});
