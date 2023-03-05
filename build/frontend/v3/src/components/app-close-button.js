import { router } from '../routing'


customElements.define("app-close-button", class extends HTMLElement {
    constructor() { super(); }
    
    connectedCallback() {
        let { back } = router;
        this.firstElementChild.onclick = back
    }
})