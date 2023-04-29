import { router } from '../routing'
import { dayOfDate, monthOfDate } from '../date-utils'
import DateConnectedElement from './date-connected-element'


customElements.define("app-calendar-cell", class extends DateConnectedElement {
    static get observedAttributes() { return [
        'data-strdate',
        'data-todaydate'
    ]; }
    _AppCalendarCell__listener = this.handleClick.bind(this)
    constructor() {
        super();
    }
    
    connectedCallback() {
        super.connectedCallback();
        this.parentElement.addEventListener("click", this._AppCalendarCell__listener)
    }
    
    disconnectedCallback() {
        super.disconnectedCallback()
        this.parentElement.removeEventListener("click", this._AppCalendarCell__listener)
    }
    
    handleClick() {
        let { strDate } = this.repaintAttributes();
        if(strDate) {
            router.goTo(["appointments", strDate])
        }
    }
    
    _repaint({ strDate, todayDate }, { view, newEvents }) {
        if(strDate) {
            let spanElement = this.querySelector("span")
            let contentElement = spanElement.querySelector(".content");
            let monthMarkerElement = spanElement.querySelector(".month");
            
            contentElement.textContent = dayOfDate(strDate)
            monthMarkerElement.textContent = monthOfDate(strDate)
            
            spanElement.classList.remove("has-new")
            for(let newEvent of newEvents) {
                if(strDate === newEvent.strDate) {
                    spanElement.classList.add("has-new")
                    break;
                }
            }
            
            if(view.get(strDate)) {
                contentElement.classList.add("nonempty")
            } else {
                contentElement.classList.remove("nonempty")
            }
            
            if(strDate === todayDate) {
                spanElement.classList.add("today");
            } else {
                spanElement.classList.remove("today")
            }
            
            if(todayDate && monthOfDate(todayDate) === monthOfDate(strDate)) {
                spanElement.classList.add("in-month");
            } else {
                spanElement.classList.remove("in-month");
            }
        }
    }
})