function PageEnvironmentConfig() {}
PageEnvironmentConfig.prototype = {
    /**
     * @type {HTMLElement}
     * @abstract
     * ------------------------------------------------------------------------
     */
    get anchorElement() { throw new Error(); },

    /**
     * @param {CredentialsInput} _credentials 
     * @returns {Promise<unknown>}
     * @abstract
     * ------------------------------------------------------------------------
     */
    authentify: function(_credentials) { throw new Error(); },

    /**
     * 
     * @returns {AuthentifiedUser}
     */
    get authentifiedUser() { throw new Error(); },

    /**
     * @param {NavigationRequest} _navigationRequest 
     * ------------------------------------------------------------------------
     */
    navigateTo: function(_navigationRequest) { throw new Error(); },
};


export { PageEnvironmentConfig };
