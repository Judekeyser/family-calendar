import { router } from '../routing'
import { backend } from '../backend'

customElements.define("app-authentication", class extends HTMLElement {
    constructor() { super(); }
    
    connectedCallback() {
        this.appendChild(document.getElementById("app-authentication").content.cloneNode(true));
        
        this.querySelector("form").onsubmit = event => {
            event.preventDefault();
            this.onSubmitForm()
            return false;
        }
    }
    
    onSubmitForm() {
        let formElement = this.querySelector("form")
        let onMessageField = this.querySelector("*[data-on=message]")
        let submitButton = formElement.querySelector("input[type=submit]")
        let passwordCandidate = formElement.passwordField.value || ""
        
        ;(async () => {
            try {
                submitButton.disabled = true
                var proceeds = await backend.update({
                    password: passwordCandidate
                }, errorCode => {
                    onMessageField.textContent = "Generic error message"
                    formElement.passwordField.focus()
                    formElement.passwordField.select()
                });
                
                if(proceeds) {
                    router.back();
                }
            } catch(error) {
                console.error(error);
                var proceeds = false;
            } finally {
                formElement.disabled = false
            }
        })()
    }
})