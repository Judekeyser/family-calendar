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
        case "afternoon": return "L'après-midi";
        case   "morning": return "Le matin";
                 default: return `À ${strTime}`;
    }
}


customElements.define("app-long-french-time", class extends HTMLElement {
    constructor() { super(); }

    static get observedAttributes() {
        return [
            "strtime"
        ];
    }

    /**
     * 
     * @param {string} name - The name of the attribute that changes
     * @param {string=} _oldValue - The previous value
     * @param {string=} newValue - The new value
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        if(name === 'strtime' && newValue) {
            const frenchTime = computeFrenchTime(newValue);
            this.textContent = frenchTime;
        } else {
            this.innerHTML = "";
        }
    }
});
