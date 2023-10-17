customElements.define("app-form-balancer", class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if(this.isConnected) {
            let sourceElement, sourceChannel; {
                const sourceBinding = this.getAttribute("data-source-bind");
                const targetReference = sourceBinding.substring(0, sourceBinding.indexOf(':'));

                sourceChannel = sourceBinding.substring(1+targetReference.length);
                sourceElement = targetReference == '^' ? this.parentElement : (
                    this.parentElement.querySelector(`*[data-id=${targetReference}]`)
                );
            }

            let sinkElement; {
                const sinkReference = this.getAttribute("data-sink-element");
                sinkElement = sinkReference == '^' ? this.parentElement : (
                    this.parentElement.querySelector(`*[data-id=${sinkReference}]`)
                );
            }

            sourceElement.addEventListener(sourceChannel, e => {
                e.preventDefault();
                let formData;
                if(e instanceof FormDataEvent) {
                    formData = e.formData;
                } else {
                    formData = e.detail.formData;
                }
                for(const [key, value] of formData.entries()) {
                    sinkElement[key].value = String(value);
                }

                sinkElement.dispatchEvent(new Event("submit"));
            });
        }
    }
});
