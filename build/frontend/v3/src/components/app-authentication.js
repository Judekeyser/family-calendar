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
                }, ({ errorCode, errorMessage }) => {
                    if(400 <= errorCode && errorCode < 500) {
                        onMessageField.textContent = errorMessage
                    } else {
                        onMessageField.textContent = "Erreur interne (c'est pas bon)"
                        console.error(errorCode, errorMessage);
                    }
                    formElement.passwordField.focus()
                    formElement.passwordField.select()
                });
            } catch(error) {
                console.error(error);
                var proceeds = false;
            } finally {
                if(proceeds) {
                    router.goTo([])
                } else {
                    let authenticationDelay = backend.state.authenticationDelay;
                    while(authenticationDelay) {
                        submitButton.value = authenticationDelay + 's...';
                        authenticationDelay -= 1
                        await new Promise(r => setTimeout(r, 1000));
                    } submitButton.value = "Ok"
                }
                submitButton.disabled = false
            }
        })()
    }
})