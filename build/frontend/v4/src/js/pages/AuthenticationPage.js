import { safeCompileOnce } from '../template-engine.js';

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

    /**
     * @returns {Promise<unknown>}
     */
    paint: async function() {
        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        const username = this.authentifiedUser.userName;
        /**
         * @type {FormAction}
         */
        const action = async (credentials) => {
            await this.authentify(credentials);
            this.navigateTo({
                url: '/calendar-grid',
                parameters: {}
            });
            return undefined;
        };
        
        this.__templates.main(
            this.anchorElement,
            {
                /**
                 * @param {{ detail: FormActionRunner }} _0 
                 */
                handleAppAuthentify: ({ detail }) => detail(action),
                username
            }
        );

        return undefined;
    }
};


export { AuthenticationPage };
