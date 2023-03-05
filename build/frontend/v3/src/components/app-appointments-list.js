import { router } from '../routing'
import DateConnectedElement from './date-connected-element'


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
    
    repaintWhenNoElements(container) {
        let template = this.querySelector("template[data-on=no-elements]")
        container.appendChild(template.content.cloneNode(true))
    }
    
    repaintWhenElements(container, strDate, appointments) {
        let template = this.querySelector("template[data-on=some-element]")
        
        let times = [...appointments.keys()]
        times.sort()
        
        function reformat(strTime, { description, unread }) {
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