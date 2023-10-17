customElements.define("app-hyperlink-trait", class extends HTMLFormElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if(this.isConnected) {
            this.style.display = "none";

            const binding = this.getAttribute("data-bind");
            if(binding) {
                const targetReference = binding.substring(0, binding.indexOf(':'));
                const channel = binding.substring(1+targetReference.length);

                const targetElement = targetReference == '^' ? this.parentElement : (
                    this.parentElement.querySelector(`*[data-id=${targetReference}]`)
                );

                targetElement.addEventListener(channel, () => this.dispatchEvent(new Event("submit")));
            }

            this.addEventListener("submit", e => {
                e.preventDefault();
                this.__doSubmit();
            });
        }
    }

    __doSubmit() {
        const formUrl = this.getAttribute("action");
        const formData = new FormData(this);
        
        const eventDetail = {
            url: formUrl,
            parameters: Object.fromEntries(formData)
        };
        console.log(">>>", formUrl, [...formData], eventDetail);
        window.dispatchEvent(new CustomEvent(
            "app-navigate",
            { detail : eventDetail }
        ));
    }

}, { extends: "form" });
