import { safeCompileOnce } from '../template-engine.js';
import { PageEnvironmentConfig } from './PageEnvironmentConfig';

/**
 * @callback FormAction
 * @param {CredentialsInput} credentials
 * @returns {Promise<unknown>}
 * @throws {BackendError}
 */

/**
 * @callback FormActionRunner
 * @param {FormAction} action
 * @returns {Promise<unknown>}
 */


customElements.define("app-authentication-form", class extends HTMLElement {
    static get observedAttributes()
        { return ['username'] }
    constructor() {
        super();
        /**
         * @type {{
         *  formElement: HTMLFormElement,
         *  passwordController: HTMLInputElement,
         *  userNameController: HTMLInputElement,
         *  errorArea: HTMLElement
         * } | undefined}
         */
        this._cache = undefined;
    }

    connectedCallback() {
        const formElement = this.#formElement;

        /**
         * @param {SubmitEvent} event 
         */
        const submitListener = event => {
            event.preventDefault();
            this.dispatchEvent(new CustomEvent("app-authentify", {
                detail: this.submit
            }));
            return undefined;
        };

        formElement.addEventListener("submit", submitListener);
    }

    /**
     * @param {('strdate')} _name 
     * @param {string | undefined} _old 
     * @param {string | undefined} newValue 
     */
    attributeChangedCallback(_name, _old, newValue) {
        this.#userNameController.value = newValue || '';
    }

    get #cache() {
        if(!this._cache) {
            const formElement = (
                /**
                 * @type { HTMLFormElement}
                 */ (this.querySelector("form"))
            );
            this._cache = (
                /**
                 * @type {{
                 *  formElement: HTMLFormElement,
                 *  passwordController: HTMLInputElement,
                 *  userNameController: HTMLInputElement,
                 *  errorArea: HTMLElement
                 * }}
                 */ ({
                    formElement,
                    passwordController: formElement['password'],
                    userNameController: formElement['identity'],
                    errorArea: this.querySelector("*[data-id=error-feedback]")
                 })
            );
        }
        return this._cache;
    }

    get #formElement() {
        return this.#cache.formElement;
    }

    get #userNameController() {
        return this.#cache.userNameController;
    }

    get #passwordController() {
        return this.#cache.passwordController;
    }

    get #errorArea() {
        return this.#cache.errorArea;
    }

    /**
     * @param {FormAction} action
     */
    submit = async (action) => {
        this.#errorArea.innerHTML = "";
        this.#userNameController.disabled = true;
        this.#passwordController.disabled = true;
        
        try {
            const credentials = {
                password: this.#passwordController.value || '',
                userName: this.#userNameController.value || ''
            };
            await action(credentials);
        } catch(error) {
            const backendError = (
                /**
                 * @type {BackendError}
                 */ (error)
            );
            const { errorCode } = backendError;
            if(errorCode && errorCode >= 400) {
                this.#errorArea.textContent = backendError.errorMessage;
            }
        } finally {
            this.#userNameController.disabled = false;
            this.#passwordController.disabled = false;
            this.#passwordController.focus();
            this.#passwordController.select();
        }
        return undefined;
    }
});


const TEMPLATE_ID = "authentication-pane";
function AuthenticationPage() {
    const templateElement = (
        /**
         * @type {HTMLElement}
         */ (document.getElementById(TEMPLATE_ID))
    );

    this.__templates = {
        main: safeCompileOnce(templateElement.innerText)
    };
}
AuthenticationPage.prototype = {
    get _environment() {
        return (
            /**
             * @type {PageEnvironmentConfig}
             */ (
                /**
                 * @type {unknown}
                 */ (this)
            )
        );
    },

    paint: async function() {
        this._environment.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        const username = this._environment.authentifiedUser.userName;
        /**
         * @type {FormAction}
         */
        const action = async (credentials) => {
            await this._environment.authentify(credentials);
            this._environment.navigateTo({
                url: '/calendar-grid',
                parameters: {}
            });
            return undefined
        };
        
        this.__templates.main(
            this._environment.anchorElement,
            {
                /**
                 * @param {{ detail: FormActionRunner }} _0 
                 */
                handleAppAuthentify: ({ detail }) => detail(action),
                username
            }
        );
    }
};


export { AuthenticationPage };
