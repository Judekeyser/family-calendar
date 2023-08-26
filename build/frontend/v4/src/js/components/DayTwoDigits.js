import { dayOfDate } from "../date-utils";


customElements.define("app-day-two-digits", class extends HTMLElement {
    constructor() {
        super();

        /**
         * @type {{
         *  strdate: string | undefined
         * }}
         */
        this.state = {
            strdate: undefined
        };
    }

    static get observedAttributes() {
        return [
            "strdate"
        ];
    }

    /**
     * 
     * @param {('strdate')} name - The name of the attribute that changes
     * @param {string | undefined} _oldValue - The previous value
     * @param {string | undefined} newValue - The new value
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this.state[name] = newValue || undefined;
        this.#paint();
    }

    #paint() {
        const strDate = this.state.strdate;
        if(strDate) {
            this.textContent = dayOfDate(strDate);
        } else {
            this.innerHTML = "";
        }
    }
});
