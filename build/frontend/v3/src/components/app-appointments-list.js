import { router } from '../routing'
import DateConnectedElement from './date-connected-element'
import { strTimeSorting, frenchMonthOfDate, frenchDayOfDate } from '../date-utils'


customElements.define("app-appointments-list", class extends DateConnectedElement {
    static get observedAttributes() { return [
        'data-strdate'
    ]}
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-appointments-list").content.cloneNode(true));
        super.connectedCallback();
    }
    
    _repaint({ strDate }, { view, newEvents }) {
        {
            let slotElement = this.querySelector("slot[name=strDate]");
            if(slotElement) {
                slotElement.textContent = this.__formatDate(strDate)
            }
        }
        
        let newAppointmentButton = this.querySelector("footer input[type=button]");
        if(newAppointmentButton) {
            if(strDate) {
                newAppointmentButton.onclick = () => router.goTo(["appointments", "new", strDate]);
                newAppointmentButton.disabled = false;
            } else {
                newAppointmentButton.onclick = () => {};
                newAppointmentButton.disabled = true;
            }
            
        }
        
        let divElement = this.querySelector("div.grid")
        if(divElement) {
            divElement.innerHTML = ""
            
            let appointments = view.get(strDate) || [];
            if(appointments.length === 0) {
                this.repaintWhenNoElements(divElement)
            } else {
                this.repaintWhenElements(divElement, strDate, appointments);
            }
        }
    }
    
    __formatDate(strDate) {
        let formattedDay = frenchDayOfDate(strDate)
        let formattedMonth = frenchMonthOfDate(strDate);
        
        return `${formattedDay} ${formattedMonth}`
    }
    
    repaintWhenNoElements(container) {
        let template = this.querySelector("template[data-on=no-elements]")
        container.appendChild(template.content.cloneNode(true))
    }
    
    repaintWhenElements(container, strDate, appointments) {
        let template = this.querySelector("template[data-on=some-element]")
        
        let times = [...appointments.keys()]
        times.sort(strTimeSorting)
        
        function reformat(strTime, { description, unread }) {
            switch(strTime) {
                case "fullday":
                    strTime = "Toute la journée"; break;
                case "afternoon":
                    strTime = "L'après-midi"; break;
                case "morning":
                    strTime = "Au matin"; break;
                default:
                    strTime = "À " + strTime; break;
            }
            return {
                strTime,
                strDescription: description,
                isUnread: unread ? "*" : ""
            }
        }
        
        for(let strTime of times) {
            let appointment = appointments.get(strTime)
            container.appendChild(template.content.cloneNode(true));
            let lastElement = container.lastElementChild;
            let reformated = reformat(strTime, appointment)
            for(let slotElement of lastElement.querySelectorAll("slot")) {
                slotElement.textContent = reformated[
                    slotElement.getAttribute("name")
                ]
            }
            lastElement.onclick = () => router.goTo(["appointments", "edit", strDate, strTime])
        }
    }
})