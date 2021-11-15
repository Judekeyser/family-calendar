function GuiMessage(channel, detail, policy) {
  this.channel = channel;
  this.detail = detail;

  if (policy && policy.includes ("global")) {
    this.isGlobal = true;
  }
  if (!policy || policy.includes ("local")) {
    this.isLocal = true;
  }
}
GuiMessage.prototype = {
  __getEvent: function() {
    return new CustomEvent (this.channel,
      { detail: this.detail }
    );
  },
  send: function() {
    [
      this.isGlobal
        ? [window]
        : undefined,
      this.isLocal
        ? [...document.querySelectorAll(`.${this.channel}`)]
        : undefined
    ].filter(_ => !!_)
    .flatten()
    .forEach(_ => _.dispatchEvent(this.__getEvent()));
  },
  sendTo: function (target) {
    target.dispatchEvent(this.__getEvent());
  }
};
