const TEMPLATE_ID = "authentication-pane";
function AuthenticationPage() {}
AuthenticationPage.prototype = {
    paint: async function() {
        this.anchorElement.setAttribute("data-id", TEMPLATE_ID);

        this.getTemplate(TEMPLATE_ID)(
            this.anchorElement,
            {
                handleAppAuthentify: ({ detail }) => {
                    const actionRunner = detail;
                    const action = async (credentials) => {
                        await this.authentify(credentials);
                        this.navigateTo({
                            url: '/calendar-grid',
                            parameters: {}
                        });
                        return undefined;
                    };
                    return actionRunner(action);
                },
                username: this.authentifiedUser.userName
            },
            "0"
        );

        return undefined;
    }
};


export { AuthenticationPage };
