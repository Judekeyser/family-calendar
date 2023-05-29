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
                    if(errorCode === 401) {
                        onMessageField.textContent = "Mot de passe incorrect"
                    } else if(errorCode === 403) {
                        onMessageField.textContent = "La page est périmée. Il faut la recharger"
                    } else {
                        onMessageField.textContent = "Je ne sais pas ce qu'il se passe, mais ce n'est pas bon"
                        console.error(error);
                    }
                    formElement.passwordField.focus()
                    formElement.passwordField.select()
                });
            } catch(error) {
                console.error(error);
                var proceeds = false;
            } finally {
                submitButton.disabled = false
            }
                
            if(proceeds) {
                console.log("MOVING")
                router.goTo([])
            } else {
                console.log("STOPPED")
            }
        })()
    }
})