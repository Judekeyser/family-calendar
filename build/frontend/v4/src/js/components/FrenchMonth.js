import { monthOfDate, validateDateString } from "../date-utils";


/**
 * Compute a French word that represents the month, from a given month,
 * as a string from '01' to '12'.
 * 
 * @param {(
*  '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'
* )} month - The month
* @returns {string} - The French name of the month
*/
function computeFrenchMonth(month)
{
    switch(month) {
        case "01": return "Janvier";
        case "02": return "Février";
        case "03": return "Mars";
        case "04": return "Avril";
        case "05": return "Mai";
        case "06": return "Juin";
        case "07": return "Juillet";
        case "08": return "Août";
        case "09": return "Septembre";
        case "10": return "Octobre";
        case "11": return "Novembre";
        case "12": return "Décembre";
          default: return "";
    }
}


customElements.define("app-french-month", class extends HTMLElement {
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
            const frenchMonth = computeFrenchMonth(monthOfDate(date));
            this.textContent = frenchMonth;
        } else {
            this.innerHTML = "";
        }
    }
});
