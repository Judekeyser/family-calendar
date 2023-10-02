customElements.define("app-hyperlink-trait", class extends HTMLFormElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if(this.isConnected) {
            this.style.display = "none";

            const parentElement = this.parentElement;
            const targetElement = parentElement && this.hasAttribute("data-bind")
                ? parentElement.querySelector(`*[data-id=${this.getAttribute("data-bind")}]`)
                : parentElement;
            
            const action = e => {
                e.preventDefault();
                this.__doSubmit();
            };
            const channel = this.getAttribute("data-on") || "click";
            targetElement.addEventListener(channel, action);
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
