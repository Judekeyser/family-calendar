import { dayOfDate } from "../date-utils"


customElements.define("app-day-two-digits", class extends HTMLElement {
    constructor() { super() }

    static get observedAttributes() {
        return [
            "strdate"
        ]
    }

    connectedCallack() {
        console.log("OK")
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "strdate" && newValue) {
            this.textContent = dayOfDate(newValue)
        } else {
            this.innerHTML = ""
        }
    }
})
