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
            let formElement = this.querySelector("form");
            
            const sentinelle = _ => {
                const initialDate = strDate;
                const initialTime = strTime;
                
                let candidateDate = _.strDate;
                let candidateTime = _.strTime;
                
                if(initialDate === candidateDate && initialTime === candidateTime) {
                    return false; // No warning
                } else {
                    let forDate = view.get(candidateDate)
                    return forDate && forDate.has(candidateTime)
                }
            }
            
            if(formElement) {
                this.setValues(formElement, {strDate, strTime, description })
                this.handleFormChange(formElement, sentinelle);
               
                formElement.appointmentrange.onchange = () => this.handleFormChange(formElement, sentinelle);
                formElement.appointmenttime.onchange = () => this.handleFormChange(formElement, sentinelle);
                formElement.appointmentdate.onchange = () => this.handleFormChange(formElement, sentinelle);
                
                formElement.cancelOnly.onchange = event => {
                    this.setValues(formElement, { description, strTime, strDate });
                    this.handleFormChange(formElement, sentinelle)
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
                                strTime: formElement.appointmentrange.value || formElement.appointmenttime.value,
                                strDescription: formElement.appointmentdescription.value
                            }
                        }, editEvent)
                    }
                    return false;
                }
            }
        }
    }
    
    setValues(formElement, { description, strDate, strTime }) {
        formElement.appointmentdate.value = strDate;
        formElement.appointmentdescription.value = description;
        
        if(strTime === 'fullday' || strTime === 'afternoon' || strTime === 'morning') {
            formElement.appointmenttime.value = "";
            formElement.appointmentrange.value = strTime;
        } else {
            formElement.appointmenttime.value = strTime;
            formElement.appointmentrange.value = "";
        }
    }
    
    handleFormChange(formElement, sentinelle) {
        let strTime = formElement.appointmentrange.value;
        var freeze = formElement.cancelOnly.checked;
        formElement.appointmentdate.disabled = freeze;
        formElement.appointmenttime.disabled = freeze || !!strTime;
        formElement.appointmentrange.disabled = freeze;
        formElement.appointmentdescription.disabled = freeze;
        
        switch(strTime) {
            case "fullday":
            case "afternoon":
            case "morning":
                break;
            default:
                strTime = formElement.appointmenttime.value;
        }
        
        let warningElement = this.querySelector("*[data-id=warning]");
        warningElement.classList.remove("appointment-conflict")
        if(sentinelle({ strTime, strDate: formElement.appointmentdate.value })) {
            warningElement.classList.add("appointment-conflict")
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