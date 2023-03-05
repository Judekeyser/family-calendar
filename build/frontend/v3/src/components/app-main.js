import { router } from '../routing'


customElements.define("app-main", class extends HTMLElement {
    __listener = event => this.handleRoute(event.detail) ? event.preventDefault() : undefined
    constructor() { super(); }
    
    connectedCallback() {
        window.addEventListener("app-route", this.__listener)
        router.resend();
    }
    
    disconnectedCallback() {
        window.removeEventListener("app-route", this.__listener)
    }
    
    handleRoute({ route }) {
        var displayedElement;
        if(route.length === 0) {
            if(window.localStorage.getItem('userName')) {
                displayedElement = document.createElement("app-calendar")
            } else {
                displayedElement = document.createElement("app-identification")
            }
        } else {
            var [firstSegment] = route;
            if(firstSegment === "authentication") {
                displayedElement = document.createElement("app-authentication")
            } else if (firstSegment === "appointments") {
                if(route.length === 2) {
                    let [_, secondSegment] = route;
                    if(secondSegment === "unread") {
                        displayedElement = document.createElement("app-appointments-unread-list")
                    } else {
                        let strDate = secondSegment
                        displayedElement = document.createElement("app-appointments-list")
                        displayedElement.setAttribute("data-strDate", strDate)
                    }
                } else {
                    var [_, secondSegment] = route;
                    if(secondSegment === "new") {
                        var [_, _, strDate] = route;
                        displayedElement = document.createElement("app-appointments-create")
                        displayedElement.setAttribute("data-strDate", strDate)
                    } else if (secondSegment === "edit") {
                        var [_, _, strDate, strTime] = route;
                        displayedElement = document.createElement("app-appointments-edit")
                        displayedElement.setAttribute("data-strdate", strDate)
                        displayedElement.setAttribute("data-strtime", strTime)
                    }
                }
            }
        }
        
        if(displayedElement) {
            this.firstElementChild.innerHTML = "";
            this.firstElementChild.append(displayedElement);
            return true;
        } return false;
    }
    
})