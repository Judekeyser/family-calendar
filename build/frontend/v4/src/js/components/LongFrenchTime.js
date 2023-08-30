import { validateTimeString } from "../date-utils";

/**
 * Computes a French fragment that best represents the time.
 * 
 * @param {TimeString} strTime - The time to convert to French
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
         *  strtime: TimeString | undefined,
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
        registerState: {
            if(newValue) {
                const maybeDate = validateTimeString(newValue);
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
        const time = this.state.strtime;
        const letterCase = this.state.case;

        if(time) {
            let frenchTime = computeFrenchTime(time);
            if(letterCase == 'lowercase') {
                frenchTime = frenchTime.toLowerCase();
            }

            this.textContent = frenchTime;
        } else {
            this.innerHTML = "";
        }
    }
});
