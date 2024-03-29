import { router } from '../routing'
import { backend } from '../backend'
import { dateTimeToString, mondayOfDateTime, nextDateTime, previousDateTime, stringToDateTime } from '../date-utils'

customElements.define("app-calendar", class extends HTMLElement {
    __currentState = {
        startDate: null,
        nbrWeek: null
    }
    constructor() { super(); }

    connectedCallback() {
        this.appendChild(document.getElementById("app-calendar").content.cloneNode(true));
        
        let formElement = this.querySelector("form");
        
        formElement.nbrWeeks.onchange = event => {
            event.preventDefault();
            this.handleNbrWeekChange(event.target.value)
            return false;
        }
        
        formElement.startDate.onchange = event => {
            event.preventDefault();
            this.handleStartDateChange(event.target.value)
            return false;
        }
        
        formElement.prevWeek.onclick = event => {
            event.preventDefault();
            this.handleMoveWeekBackward();
            return false;
        }
        
        formElement.nextWeek.onclick = event => {
            event.preventDefault();
            this.handleMoveWeekForward();
            return false;
        }
        
        /* initial startDate */ {
            let candidate = window.localStorage.getItem('preference-calendar-startDate');
            if(!candidate) {
                candidate = dateTimeToString(Date.now());
            }
            formElement.startDate.value = candidate;
            this.handleStartDateChange(candidate);
        }
        /* initial nbrWeek */ {
            let candidate = window.localStorage.getItem('preference-calendar-nbrWeek');
            if(!candidate) {
                candidate = formElement.nbrWeeks.value;
            }
            formElement.nbrWeeks.value = candidate;
            this.handleNbrWeekChange(candidate);
        }
        
        this.querySelector("*[data-id=all-unread]").onclick = () => router.goTo(["appointments", "unread"])
    }
    
    handleMoveWeekForward() {
        if(this.__currentState.startDate) {
            let cursor = stringToDateTime(this.__currentState.startDate)
            for(let i = 0; i < 7; i++)
                cursor = nextDateTime(cursor);
            this.handleStartDateChange(dateTimeToString(cursor))
        }
    }
    
    handleMoveWeekBackward() {
        if(this.__currentState.startDate) {
            let cursor = stringToDateTime(this.__currentState.startDate)
            for(let i = 0; i < 7; i++)
                cursor = previousDateTime(cursor);
            this.handleStartDateChange(dateTimeToString(cursor))
        }
    }
    
    handleNbrWeekChange(nbrWeek) {
        window.localStorage.setItem('preference-calendar-nbrWeek', nbrWeek)
        if(this.__currentState.nbrWeek !== nbrWeek) {
            this.__currentState.nbrWeek = nbrWeek
            this.handleStateChange();
        }
    }
    
    handleStartDateChange(startDate) {
        window.localStorage.setItem('preference-calendar-startDate', startDate)
        if(this.__currentState.startDate !== startDate) {
            this.__currentState.startDate = startDate
            this.handleStateChange();
        }
    }
    
    handleStateChange() {
        let { nbrWeek, startDate } = this.__currentState
        
        {
            let formElement = this.querySelector("form");
            if(formElement.startDate && startDate) {
                formElement.startDate.value = startDate
            }
        }
        
        if(nbrWeek && startDate) {
            let tbodyElement = this.querySelector("tbody");
            tbodyElement.innerHTML = ""
            let templateElement = this.querySelector("table template")
            let cursor = mondayOfDateTime(stringToDateTime(startDate))
            for(let i = 0; i < nbrWeek; i++) {
                let trElement = document.createElement("tr")
                tbodyElement.appendChild(trElement)
                for(let j = 0; j < 7; j++) {
                    let tdElement = document.createElement("td");
                    trElement.appendChild(tdElement);
                    let cellElement = templateElement.content.cloneNode(true)
                    tdElement.appendChild(cellElement);
                    cellElement = tdElement.firstElementChild;
                    cellElement.setAttribute("data-strdate", dateTimeToString(cursor))
                    cellElement.setAttribute("data-todaydate", dateTimeToString(Date.now()))
                    cursor = nextDateTime(cursor);
                }
            }
        }
    }
})