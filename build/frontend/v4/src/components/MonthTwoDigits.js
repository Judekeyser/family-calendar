import { monthOfDate } from "../date-utils"


customElements.define("app-month-two-digits", class extends HTMLElement {
    constructor() { super() }

    static get observedAttributes() {
        return [
            "strdate"
        ]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name == 'strdate' && newValue) {
            this.textContent = monthOfDate(newValue)
        } else {
            this.innerHTML = ""
        }
    }
})