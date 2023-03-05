import { router } from '../routing'
import DateConnectedElement from './date-connected-element'


customElements.define("app-appointments-create", class extends DateConnectedElement {
    static get observedAttributes() { return [
        'data-strdate'
    ]}
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-appointments-create").content.cloneNode(true));
        super.connectedCallback();
    }
    
    _repaint({ strDate }, { view, createEvent }) {
        let formElement = this.querySelector("form");
        let warningElement = this.querySelector("*[data-id=warning]")
        
        if(formElement) {
            formElement.appointmentdate.value = strDate;
            
            formElement.onsubmit = event => {
                event.preventDefault();
                this.handleCreateAppointment({
                    strDate,
                    strTime: formElement.appointmenttime.value,
                    strDescription: formElement.appointmentdescription.value
                }, createEvent)
                return false;
            }
            
            warningElement.classList.remove("appointment-conflict")
            let dayView = view.get(strDate)
            if(dayView) {
                formElement.appointmenttime.onchange = event => {
                    if(dayView.has(event.target.value)) {
                        warningElement.classList.add("appointment-conflict")
                    } else {
                        warningElement.classList.remove("appointment-conflict")
                    }
                }
            }
        }
    }
    
    handleCreateAppointment(newEvent, createEvent) {
        let buttonElement = document.querySelector("input[type=submit]")
        
        buttonElement.disabled = true
        ;(async() => {
            try {
                if(await createEvent(newEvent)) {
                    router.back()
                }
            } finally {
                buttonElement.disabled = false;
            }
        })()
    }
    
})