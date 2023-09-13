const TEMPLATE_ID = "authentication-pane";

/**
 * @this {AppPage}
 * @param {CredentialsInput} credentials
 * @returns {Promise<unknown>}
 */
async function onFormSubmit(credentials) {
    await this.authentify(credentials);
    this.navigateTo({
        url: '/calendar-grid',
        parameters: {}
    });
    return undefined;
}

/**
 * @this {AppPage}
 * @returns {Promise<unknown>}
 */
async function paintAuthenticationPage() {
    this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

    /**
     * @param {AppEvent.<ActionRunner.<CredentialsInput>>} _
     */
    const handleAppAuthentify = ({ detail }) => void detail(onFormSubmit.bind(this));

    this.getTemplate(TEMPLATE_ID)(
        this.anchorElement,
        {
            username: this.authentifiedUser.userName,
            handleAppAuthentify
        },
        "0"
    );

    return undefined;
}


function AuthenticationPage() {}
AuthenticationPage.prototype = {
    paint: paintAuthenticationPage
};


export { AuthenticationPage, paintAuthenticationPage };
