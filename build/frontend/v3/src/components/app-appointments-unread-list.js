import { router } from '../routing'
import { backend } from '../backend'
import { frenchMonthOfDate, dayOfDate, yearOfDate } from '../date-utils'
import DateConnectedElement from './date-connected-element'


customElements.define("app-appointments-unread-list", class extends DateConnectedElement {
    static get observedAttributes() { return [] }
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-appointments-unread-list").content.cloneNode(true));
        super.connectedCallback();
    }
    
    _repaint({ todayDate }, { view, newEvents }) {
        let markAllReadButton = this.querySelector("footer input[type=button]");
        if(markAllReadButton) {
            markAllReadButton.onclick = () => {}
        }
        
        let divElement = this.querySelector("div.grid")
        if(divElement) {
            divElement.innerHTML = ""
            
            console.log(newEvents)
            if(newEvents.length === 0) {
                this.repaintWhenNoElements(divElement)
            } else {
                this.repaintWhenElements(divElement, view, [...newEvents], todayDate);
            }
        }
    }
    
    repaintWhenNoElements(container) {
        let template = this.querySelector("template[data-on=no-elements]")
        container.appendChild(template.content.cloneNode(true))
        
        let footerElement = this.querySelector("footer");
        footerElement.classList.add("hidden")
    }
    
    repaintWhenElements(container, view, newEvents, todayDate) {
        let todayYear = todayDate ? yearOfDate(todayDate) : null;
        let template = this.querySelector("template[data-on=some-element]")
        
        function sortFn(x, y) {
            if(x.strDate < y.strDate) {
                return -1;
            } else if(x.strDate > y.strDate) {
                return 1;
            } else {
                if(x.strTime < y.strTime) {
                    return -1;
                } else if (x.strTime > y.strTime) {
                    return 1;
                } else {
                    return 0;
                }
            }
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
        
        for(let { strDate, strTime } of newEvents) {
            let appointment = appointmentOf(strDate, strTime)
            if(!appointment) continue;
            container.appendChild(template.content.cloneNode(true));
            let lastElement = container.lastElementChild;
            let reformated = {
                "strDate-day": dayOfDate(strDate),
                "strDate-month": frenchMonthOfDate(strDate),
                "strDate-year": todayYear && todayDate < strDate ? yearOfDate(strDate) : "",
                strTime,
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