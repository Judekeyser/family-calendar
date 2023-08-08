import { monthOfDate, dayOfDate } from "../date-utils"


customElements.define("app-long-french-date", class extends HTMLElement {
    constructor() { super() }

    static get observedAttributes() {
        return [
            "strdate"
        ]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'strdate' && newValue) {

            let frenchMonth;
            switch(monthOfDate(newValue)) {
                case "01": { frenchMonth = "Janvier" } break;
                case "02": { frenchMonth = "Février" } break;
                case "03": { frenchMonth = "Mars" } break;
                case "04": { frenchMonth = "Avril" } break;
                case "05": { frenchMonth = "Mai" } break;
                case "06": { frenchMonth = "Juin" } break;
                case "07": { frenchMonth = "Juillet" } break;
                case "08": { frenchMonth = "Août" } break;
                case "09": { frenchMonth = "Septembre" } break;
                case "10": { frenchMonth = "Octobre" } break;
                case "11": { frenchMonth = "Novembre" } break;
                case "12": { frenchMonth = "Décembre" } break;
            }

            let frenchDay = dayOfDate(newValue);
            if(frenchDay == 1) {
                let firstSegment = document.createTextNode('1')
                let exponent = document.createElement('sup')
                exponent.textContent = 'er'
                let secondSegment = document.createTextNode(' ' + frenchMonth)

                this.appendChild(firstSegment)
                this.appendChild(exponent)
                this.appendChild(secondSegment)
            } else {
                switch(frenchDay) {
                    case "01": { frenchDay = "1er" } break;
                    case "02": { frenchDay = "2" } break;
                    case "03": { frenchDay = "3" } break;
                    case "04": { frenchDay = "4" } break;
                    case "05": { frenchDay = "5" } break;
                    case "06": { frenchDay = "6" } break;
                    case "07": { frenchDay = "7" } break;
                    case "08": { frenchDay = "8" } break;
                    case "09": { frenchDay = "9" } break;
                }
                
                this.textContent = `Le ${frenchDay} ${frenchMonth}`
            }
        } else {
            this.innerHTML = ""
        }
    }
})
