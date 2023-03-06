import { router } from '../routing'


customElements.define("app-identification", class extends HTMLElement {   
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-identification").content.cloneNode(true))
        
        var formElement, storedUserName;
        
        formElement = this.querySelector("form");
        
        formElement.onsubmit = event => {
            event.preventDefault();
            let userName = formElement.userId.value;
            window.localStorage.setItem('userName', userName);
            router.goTo([])
            return false;
        }
        
        if((storedUserName = window.localStorage.getItem('userName'))) {
            for(let elem of formElement.querySelectorAll('input[name=userId]'))
                if(elem.value === storedUserName)
                    elem.checked = true
        }
    }
})