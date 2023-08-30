import { monthOfDate, dayOfDate, validateDateString } from "../date-utils";


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


/**
 * Compute a French number from a day in month. This is done by turning
 * removing leading zeros, and in the case of '01', replacing with '1er'.
 * 
 * @param {(
 *  '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|
*   '11'|'12'|'13'|'14'|'15'|'16'|'17'|'18'|'19'|'20'|
*   '21'|'22'|'23'|'24'|'25'|'26'|'27'|'28'|'29'|'30'|'31'
 * )} day - The day
 * @returns {string} - The French representation of the day
 */
function computeFrenchDay(day)
{
    switch(day) {
        case "01": return "1er";
        case "02": return "2";
        case "03": return "3";
        case "04": return "4";
        case "05": return "5";
        case "06": return "6";
        case "07": return "7";
        case "08": return "8";
        case "09": return "9";
          default: return day;
    }
}


customElements.define("app-long-french-date", class extends HTMLElement {
    constructor() {
        super();
        /**
         * @type {{
         *  strdate: DateString | undefined,
         *  case: string | undefined
         * }}
         */
        this.state = {
            strdate: undefined,
            case: undefined
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
            const frenchDay = computeFrenchDay(dayOfDate(date));

            if(frenchDay == '1er') {
                this.innerHTML = `1<sup>er</sup> `;
                this.appendChild(document.createTextNode(frenchMonth));
            } else {
                this.textContent = `${frenchDay} ${frenchMonth}`;
            }
        } else {
            this.innerHTML = "";
        }
    }
});
