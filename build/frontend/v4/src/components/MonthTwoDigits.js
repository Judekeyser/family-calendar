import { monthOfDate } from "../date-utils";


customElements.define("app-month-two-digits", class extends HTMLElement {
    constructor() { super(); }

    static get observedAttributes() {
        return [
            "strdate"
        ];
    }

    /**
     * 
     * @param {string} name - The name of the attribute that changes
     * @param {string=} _oldValue - The previous value
     * @param {string=} newValue - The new value
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        if(name == 'strdate' && newValue) {
            this.textContent = monthOfDate(newValue);
        } else {
            this.innerHTML = "";
        }
    }
});