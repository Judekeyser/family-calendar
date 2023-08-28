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
