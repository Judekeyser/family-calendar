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
		.forEach(_ => _.dispatchEvent(
			new CustomEvent(this.channel,
					{ detail: this.detail }
			)
		));
	}
};
