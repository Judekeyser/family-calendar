import { monthOfDate, validateDateString } from "../date-utils";


customElements.define("app-month-two-digits", class extends HTMLElement {
    constructor() {
        super();

        /**
         * @type {{
         *  strdate: DateString | undefined
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
        registerState: {
            if(newValue) {
                const maybeDate = validateDateString(newValue);
                if(maybeDate) {
                    this.state[name] = maybeDate;
                    break registerState;
                }
            }
            this.state[name] = undefined;
        }
        this.#paint();
    }

    #paint() {
        const date = this.state.strdate;
        if(date) {
            this.textContent = monthOfDate(date);
        } else {
            this.innerHTML = "";
        }
    }
});