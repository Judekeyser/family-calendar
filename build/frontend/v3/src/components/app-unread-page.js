import { router } from '../routing'
import { backend } from '../backend'
import { dateTimeToString } from '../date-utils'
import DateConnectedElement from './date-connected-element'


customElements.define("app-unread-page", class extends DateConnectedElement {
    static get observedAttributes() { return [] }
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-unread-page").content.cloneNode(true));
        super.connectedCallback();
    }
    
    _repaint({ todayDate }) {
        this.querySelector("app-unread-appointments-list").setAttribute(
            "data-todaydate", dateTimeToString(Date.now())
        )
    }
})