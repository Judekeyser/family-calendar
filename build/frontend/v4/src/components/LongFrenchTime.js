customElements.define("app-long-french-time", class extends HTMLElement {
    constructor() { super() }

    static get observedAttributes() {
        return [
            "strtime"
        ]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'strtime' && newValue) {
            let french;
            switch(newValue) {
                case   "fullday": { french = "Toute la journée" } break;
                case "afternoon": { french = "L'après-midi" } break;
                case   "morning": { french = "Le matin" } break;
                default: { french = `À ${newValue}` } break;
            }

            this.textContent = french
        } else {
            this.innerHTML = ""
        }
    }
})
