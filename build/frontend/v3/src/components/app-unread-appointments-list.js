import { router } from '../routing'
import { backend } from '../backend'
import { frenchMonthOfDate, dayOfDate, yearOfDate, strTimeSorting } from '../date-utils'
import DateConnectedElement from './date-connected-element'


customElements.define("app-unread-appointments-list", class extends DateConnectedElement {
    static get observedAttributes() { return ["data-todaydate"] }
    constructor() { super(); }
    
    connectedCallback() {
        super.connectedCallback();
    }
    
    _repaint({ todayDate }, { view, newEvents }) {
        let rootElement = this.querySelector("*[data-for=root]")
        if(rootElement) {
            rootElement.innerHTML = ""
            
            if(newEvents.length === 0) {
                this.repaintWhenNoElements(rootElement)
            } else {
                this.repaintWhenElements(rootElement, view, [...newEvents], todayDate);
            }
        }
    }
    
    repaintWhenNoElements(container) {
        let template = this.querySelector("template[data-for=no-elements]")
        container.appendChild(template.content.cloneNode(true))
    }
    
    repaintWhenElements(container, view, newEvents, todayDate) {
        { /* Insert base template */
            let template = this.querySelector("template[data-for=some-element]")
            container.appendChild(template.content.cloneNode(true))
            
            let footerElement = container.querySelector("footer")
            footerElement.querySelector("input[type=button]").onclick = function() {
                this.disabled = true;
                backend.markRead().finally(() => {
                    this.disabled = false;
                })
            }
        }
        let todayYear = todayDate ? yearOfDate(todayDate) : null;
        
        container = container.querySelector("*[data-for=element-list]")
        let template = this.querySelector("template[data-for=foreach-element]")
        
        function sortFn(x, y) {
            if(x.strDate < y.strDate) {
                return -1;
            } else if(x.strDate > y.strDate) {
                return 1;
            } else return strTimeSorting(x.strTime, y.strTime);
        } 
        newEvents.sort(sortFn)
        
        function appointmentOf(strDate, strTime) {
            let _view = view
            if(_view.has(strDate)) {
                _view = _view.get(strDate);
                if(_view.has(strTime)) {
                    return _view.get(strTime)
                }
            }
            return null;
        }
        
        function formatStrTime(strTime) {
            switch(strTime) {
                case "fullday":
                    return "toute la journée";
                case "afternoon":
                    return "tout l'après-midi";
                case "morning":
                    return "toute la matinée";
                default:
                    return "à " + strTime;
            }
        }
        
        for(let { strDate, strTime } of newEvents) {
            let appointment = appointmentOf(strDate, strTime)
            if(!appointment) continue;
            container.appendChild(template.content.cloneNode(true));
            let lastElement = container.lastElementChild;
            let yearOfAppointment = yearOfDate(strDate)
            let reformated = {
                "strDate-day": dayOfDate(strDate),
                "strDate-month": frenchMonthOfDate(strDate),
                "strDate-year": todayYear && todayYear !== yearOfAppointment ? (" " + yearOfAppointment) : "",
                strTime: formatStrTime(strTime),
                strDescription: appointment.description
            }
            for(let slotElement of lastElement.querySelectorAll("slot")) {
                slotElement.textContent = reformated[
                    slotElement.getAttribute("name")
                ];
            }
            lastElement.onclick = () => router.goTo(["appointments", "edit", strDate, strTime])
        }
        
        let footerElement = this.querySelector("footer")
        footerElement.classList.remove("hidden")
        footerElement.querySelector("*").onclick = function() {
            this.disabled = true;
            backend.markRead().finally(() => {
                this.disabled = false;
            })
        }
    }
})