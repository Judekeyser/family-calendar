function EventEmitter({ channel })
{
    this._EventEmitter__channel = channel
}
EventEmitter.prototype =
{
    _emitEvents: function(detail) {
        return dispatchEvent(new CustomEvent(this._EventEmitter__channel, {
            cancellable: true,
            detail
        }))
    }
}


export { EventEmitter }