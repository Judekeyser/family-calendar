customElements.define("app-form-balancer", class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if(this.isConnected) {
            const sourceBind = this.getAttribute("data-source-bind");
            const sourceOn = this.getAttribute("data-source-on");
            const sinkBind = this.getAttribute("data-sink-bind");
            const sinkOn = this.getAttribute("data-sink-on");

            const source = sourceBind ? this.querySelector(`*[data-id=${sourceBind}]`) : this;
            const sink = sinkBind ? this.querySelector(`*[data-id=${sinkBind}]`) : this;

            source.addEventListener(sourceOn, e => {
                e.preventDefault();
                let formData;
                if(e instanceof FormDataEvent) {
                    formData = e.formData;
                } else {
                    formData = e.detail.formData;
                }
                for(const [key, value] of formData.entries()) {
                    sink[key].value = String(value);
                }
                sink.dispatchEvent(new CustomEvent(sinkOn));
            });
        }
    }
});
