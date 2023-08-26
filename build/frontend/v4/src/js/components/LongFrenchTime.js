/**
 * Computes a French fragment that best represents the time.
 * 
 * @param {string} strTime - The time to convert to French
 * @returns {string} A French version of the time.
 */
function computeFrenchTime(strTime)
{
    switch(strTime) {
        case   "fullday": return "Toute la journée";
        case "afternoon": return "En après-midi";
        case   "morning": return "Au matin";
                 default: return `À ${strTime}`;
    }
}


customElements.define("app-long-french-time", class extends HTMLElement {
    constructor() {
        super();

        /**
         * @type {{
         *  strtime: string | undefined,
         *  case: string | undefined
         * }}
         */
        this.state = {
            strtime: undefined,
            case: undefined
        };
    }

    static get observedAttributes() {
        return [
            "strtime",
            "case"
        ];
    }

    /**
     * 
     * @param {('strtime' | 'case')} name - The name of the changing attribute
     * @param {string | undefined} _oldValue - The previous value
     * @param {string | undefined} newValue - The new value
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this.state[name] = newValue || undefined;
        this.#paint();
    }

    #paint() {
        const strTime = this.state.strtime;
        const letterCase = this.state.case;

        if(strTime) {
            let frenchTime = computeFrenchTime(strTime);
            if(letterCase == 'lowercase') {
                frenchTime = frenchTime.toLowerCase();
            }

            this.textContent = frenchTime;
        } else {
            this.innerHTML = "";
        }
    }
});
