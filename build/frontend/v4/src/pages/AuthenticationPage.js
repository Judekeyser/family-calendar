import { compile } from '../template-engine.js';


function submitForm(formElement, doSubmit) {
    let password = formElement.password.value || '';
    let userName = formElement.identity.value || '';

    (async () => {
        let controllers = [
            formElement.password,
            formElement.identity,
            formElement.querySelector("button")
        ];

        try {
            for(let ctrl of controllers) {
                ctrl.disabled = true;
            }
            await doSubmit({ userName, password });
        } catch(error) {
            let { errorCode, errorMessage } = error;
            if([401,403,429].includes(errorCode)) {
                formElement.querySelector(
                    "*[data-id=error-feedback-container]"
                ).classList.remove("hidden");
                formElement.querySelector(
                    "*[data-id=error-feedback]"
                ).textContent = errorMessage;
                formElement.password.focus();
                formElement.password.select();
            } else {
                console.error(error);
            }
        } finally {
            for(let ctrl of controllers) {
                ctrl.disabled = false;
            }
        }
    })();
}

function AuthenticationPage() {
    this.__templates = {
        main: compile(
            document.getElementById("authentication-pane").innerText
        )
    };
}
AuthenticationPage.prototype = {
    paint: async function() {
        
        this.__templates.main(
            this.anchorElement,
            {
                handleSubmit: e => {
                    e.preventDefault();
                    submitForm(e.target, async ({ userName, password }) => {
                        await this.authentify({ userName, password });
                        this.navigateTo({
                            url: '/calendar-grid/',
                            parameters: {}
                        });
                    });
                }
            }
        ).next();

        let { userName } = this.authentifiedUser;
        if(userName) {
            this.anchorElement.querySelector(
                "*[data-id=user-identity]"
            ).value = userName;
        }
    }

};


export { AuthenticationPage };
