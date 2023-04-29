
function History({ deleteEvent, createEvent, patchCursor }) {
    this._deleteEvent = deleteEvent;
    this._createEvent = createEvent;
    this._patchCursor = patchCursor;
}
History.prototype = {
    
    /* Exposed getters */
    
    get deleteEvent() {
        return this._deleteEvent.bind(this)
    },
    
    get createEvent() {
        return this._createEvent.bind(this)
    },
    
    get patchCursor() {
        return this._patchCursor.bind(this)
    }
}

export { History }