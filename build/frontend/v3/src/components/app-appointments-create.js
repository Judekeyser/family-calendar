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
        let dayView = view.get(strDate)
        let formElement = this.querySelector("form");
        
        if(formElement) {
            formElement.appointmentdate.value = strDate;
            
            const sentinelle = ({ strDate, strTime }) => {
                var forDate = view.get(strDate)
                return forDate && forDate.has(strTime)
            }
            formElement.appointmentrange.onchange = () => this.handleFormChange(formElement, sentinelle);
            formElement.appointmenttime.onchange = () => this.handleFormChange(formElement, sentinelle);
            formElement.appointmentdate.onchange = () => this.handleFormChange(formElement, sentinelle);
            
            this.handleFormChange(formElement, sentinelle);
            
            formElement.onsubmit = event => {
                event.preventDefault();
                this.handleCreateAppointment({
                    strDate: formElement.appointmentdate.value,
                    strTime: formElement.appointmentrange.value || formElement.appointmenttime.value,
                    strDescription: formElement.appointmentdescription.value
                }, createEvent)
                return false;
            }
        }
    }
    
    handleFormChange(formElement, sentinelle) {
        let appointmentRange = formElement.appointmentrange.value;
        formElement.appointmenttime.disabled = !!appointmentRange;
        
        let warningElement = this.querySelector("*[data-id=warning]");
        warningElement.classList.remove("appointment-conflict")
        var strTime = formElement.appointmentrange.value;
        switch(strTime) {
            case "fullday":
            case "afternoon":
            case "morning":
                break;
            default:
                strTime = formElement.appointmenttime.value;
        }
        if(sentinelle({ strTime, strDate: formElement.appointmentdate.value })) {
            warningElement.classList.add("appointment-conflict")
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