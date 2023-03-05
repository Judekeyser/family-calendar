import { router } from '../routing'
import DateConnectedElement from './date-connected-element'


customElements.define("app-appointments-edit", class extends DateConnectedElement {
    static get observedAttributes() { return [
        'data-strdate',
        'data-strtime'
    ]}
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-appointments-edit").content.cloneNode(true));
        super.connectedCallback();
    }
    
    _repaint({ strDate, strTime }, { editEvent, cancelEvent, view }) {
        let formElement = this.querySelector("form");
        
        {
            if(!strDate || !strTime) return;
            if(!view) return;
            let forDate = view.get(strDate);
            if(!forDate) return;
            let forDateTime = forDate.get(strTime);
            if(!forDateTime) return;
            
            var { description } = forDateTime
        }
        
        if(strDate && strTime && description) {
            if(formElement) {
                formElement.appointmentdate.value = strDate;
                formElement.appointmenttime.value = strTime;
                formElement.appointmentdescription.value = description;
                
                formElement.cancelOnly.onchange = event => {
                    if(event.target.checked) {
                        formElement.appointmentdate.value = strDate;
                        formElement.appointmenttime.value = strTime;
                        formElement.appointmentdescription.value = description;
                        formElement.appointmentdate.disabled = true;
                        formElement.appointmenttime.disabled = true;
                        formElement.appointmentdescription.disabled = true;
                    } else {
                        formElement.appointmentdate.disabled = false;
                        formElement.appointmenttime.disabled = false;
                        formElement.appointmentdescription.disabled = false;
                    }
                }
                
                formElement.onsubmit = event => {
                    event.preventDefault();
                    if(formElement.cancelOnly.checked) {
                        this.handleEditCalendar({
                            strDate, strTime
                        }, cancelEvent)
                    } else {
                        this.handleEditCalendar({
                            toCancel: { strDate, strTime },
                            toCreate: {
                                strDate: formElement.appointmentdate.value,
                                strTime: formElement.appointmenttime.value,
                                strDescription: formElement.appointmentdescription.value
                            }
                        }, editEvent)
                    }
                    return false;
                }
            }
        }
    }
    
    handleEditCalendar(newEvent, action) {
        let buttonElement = document.querySelector("input[type=submit]")
        
        buttonElement.disabled = true
        ;(async() => {
            try {
                if(await action(newEvent)) {
                    router.back()
                }
            } finally {
                buttonElement.disabled = false;
            }
        })()
    }
    
})